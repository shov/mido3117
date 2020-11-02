#include <stdio.h>
#include <unistd.h>
#include <sys/time.h>
#include "sys/wait.h"
#include "signal.h"
#include "sys/mman.h"
#include "./stack.h"

/////// SHARED MEMORY
typedef struct Proc_Data Proc_Data;

struct Proc_Data {
    pid_t pid;
    pid_t ppid;
    int num;
    Proc_Data *link_to_call;
    int sig;
    int mutex;

    int (*get_signal)(Proc_Data *);
};

int get_signal(Proc_Data *process_entity) {
    int sig = process_entity->sig;
    if (process_entity->sig == SIGUSR1) {
        process_entity->sig = SIGUSR2;
    } else {
        process_entity->sig = SIGUSR1;
    }
    return sig;
}

Proc_Data *processes;
int *log_counter;

/////// TIMING
void wait100ms() {
    usleep(100000);
}

/**
 * Get now in milliseconds
 * @return
 */
unsigned long get_now_ms() {
    struct timeval tv;
    gettimeofday(&tv, NULL);
    return (1000000 * tv.tv_sec + tv.tv_usec) / 1000;
}

/**
 * Check if give ms had been passed
 * @param from
 * @param ms
 * @return
 */
int did_past_ms(unsigned long from, int ms) {
    return get_now_ms() - from >= ms ? 1 : 0;
}

/////// SIGNALS
char *get_signal_name(int sig) {
    switch (sig) {
        case SIGUSR1:
            return "SIGUSR1";
        case SIGUSR2:
            return "SIGUSR2";
        default:
            return "UNKNOWN";
    }
}

int *me_ptr;
Sig_Stack *sig_stack_ptr;
int time_of_termination = 0;

void sig_handler(int sig) {
    switch (sig) {
        case SIGUSR1:
        case SIGUSR2:
            if (0 != sig_stack_ptr->push(sig_stack_ptr, sig)) {
                printf("[Process %d] incoming signals stack is full, got signal %s.\n",
                       processes[*me_ptr].num,
                       get_signal_name(sig)
                );
            }
            break;
        default:
            printf("[Process %d] got unhandled signal, terminating is required\n", processes[*me_ptr].num);
            time_of_termination = 1;
    }
};

/////// MAIN
int main(int argc, char **args) {
    printf("Started\n");
    processes = mmap(NULL, sizeof(Proc_Data) * 4, PROT_READ | PROT_WRITE,
                     MAP_SHARED | MAP_ANONYMOUS, -1, 0);
    log_counter = mmap(NULL, sizeof(int), PROT_READ | PROT_WRITE,
                       MAP_SHARED | MAP_ANONYMOUS, -1, 0);

    //Init global counter
    *log_counter = 0;

    //Max processes
    int threshold = 4;

    //Current process number
    int me;

    //Set signal handlers
    signal(SIGUSR1, sig_handler);
    signal(SIGUSR2, sig_handler);
    signal(SIGINT, sig_handler);

    //Child tmp pid
    pid_t child;

    //Forking
    for (int i = 0; i < threshold; i++) {
        me = i;
        processes[me].pid = getpid();
        processes[me].ppid = getppid();
        processes[me].num = me + 1;
        processes[me].link_to_call = &processes[me + 1];
        processes[me].sig = SIGUSR1;
        processes[me].get_signal = &get_signal;

        //Up mutex hard for everyone, root process wil unset it later
        processes[me].mutex = -1;


        child = fork();
        //It's parent
        if (child > 0) {
            sig_stack_ptr = create_sig_stack();
            printf("%d process initialized\n", me);
            //Loop the last one
            if (me == threshold - 1) {
                processes[me].link_to_call = &processes[0];
                processes[me].sig = SIGUSR2;
            }
            child = 0;
            break;
        }
        child = 0;
    }

    //Set global me pointer to current me
    me_ptr = &me;

    //Wait all processes are ready
    while (processes[threshold - 1].pid < 1) {
        wait100ms();
    }

    //All processes are ready, print info
    if (me == 0) {
        printf("Ready. Initial info:\n");
        for (int i = 0; i < threshold; i++) {
            printf("Process %d, PPID: %d, PID: %d, should call %d, with signal %s for the first round\n",
                   processes[i].num,
                   processes[i].ppid,
                   processes[i].pid,
                   processes[i].link_to_call->num,
                   get_signal_name(processes[i].sig)
            );
        }

        //Unset mutex
        //everyone get soft blocked but 1st process, since it should be first in the chain
        for (int i = 1; i < threshold; i++) {
            processes[i].mutex = 1;
        }
        processes[0].mutex = 0;
    }

    //The loop
    unsigned long timer = 0;
    int had_been_called = 0;
    while (1) {
        //Check the stack to log incoming signals
        while (1) {
            int *sig = sig_stack_ptr->pop(sig_stack_ptr);
            if (NULL == sig) {
                break;
            }

            printf("[Process %d] (PID: %d) got a signal %s\n",
                   processes[me].num,
                   processes[me].pid,
                   get_signal_name(*sig)
            );
            printf("[%d] pid %d, ppid %d, current time %li, process number %d get %s\n",
                   ++(*log_counter), processes[me].pid, processes[me].ppid,
                   get_now_ms(), processes[me].num,
                   get_signal_name(*sig)
            );

            had_been_called = 1;
        }

        //Check mutex for calling others with signals
        switch (processes[me].mutex) {
            case -1:
                //Blocked hard, skip sending
                break;
            case 0:
                //Opened, block and send
                processes[me].mutex = 1;
                timer = get_now_ms();
                had_been_called = 0;

                int sig_to_call = processes[me].get_signal(&processes[me]);

                //Required log line
                printf("[%d] pid %d, ppid %d, current time %li, process number %d put %s\n",
                       ++(*log_counter), processes[me].pid, processes[me].ppid,
                       get_now_ms(), processes[me].num,
                       get_signal_name(sig_to_call)
                );

                printf("[Process %d] (PID: %d) calls process %d (PID: %d) with signal %s...\n",
                       processes[me].num, processes[me].pid,
                       processes[me].link_to_call->num, processes[me].link_to_call->pid,
                       get_signal_name(sig_to_call)
                );

                int ack = kill(processes[me].link_to_call->pid, sig_to_call);
                printf("[Process %d] (PID: %d) made a call to process %d (PID: %d) with signal %s, status %d\n",
                       processes[me].num, processes[me].pid,
                       processes[me].link_to_call->num, processes[me].link_to_call->pid,
                       get_signal_name(sig_to_call), ack
                );

                break;
            case 1:
                //Blocked, check the timer
                //and check if the process has been already called, not to break the chain
                //if so unset if it's time
                if (did_past_ms(timer, 100) && had_been_called) {
                    processes[me].mutex = 0;
                }
                break;
        }

        if (time_of_termination) {
            if (me != 0) {
                printf("[Process %d] is being terminated\n", processes[me].num);
            }
            break;
        }
    }

    //Release resources
    destroy_sig_stack(sig_stack_ptr);
    printf("[Process %d] unmapping shared memory\n", processes[me].num);
    munmap(processes, sizeof(Proc_Data) * 4);
    if (0 == me) {
        printf("[Process %d] is waiting the children are terminated\n", me + 1);
        int stat;
        wait(&stat);
        printf("[Process %d] reports: child processes terminated, stat: %d\n", me + 1, stat);
        printf("[Process %d] is being terminated\n", me + 1);
    }
}