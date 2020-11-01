#include <stdlib.h>
#include "./stack.h"


Sig_Stack* create_sig_stack() {
    Sig_Stack* stack = malloc(sizeof(Sig_Stack));
    stack->top = -1;
    stack->push = & push_sig_stack;
    stack->pop = & pop_sig_stack;
    return stack;
}

void destroy_sig_stack(Sig_Stack* stack) {
    free(stack);
}

int push_sig_stack(Sig_Stack* stack, int signal) {
    if(stack->top == MAXSIZE - 1) {
        //Full
        return -1;
    }

    stack->values[++stack->top] = signal;
    return 0;
}

int* pop_sig_stack(Sig_Stack* stack) {
    if(stack->top == - 1) {
        //Empty
        return NULL;
    }

    return &stack->values[stack->top--];
}


