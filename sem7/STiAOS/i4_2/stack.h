typedef struct Signals_Stack Signals_Stack;

#define MAXSIZE 10

typedef struct Sig_Stack Sig_Stack;

Sig_Stack *create_sig_stack();

void destroy_sig_stack(Sig_Stack *stack);

int push_sig_stack(Sig_Stack *stack, int signal);

int *pop_sig_stack(Sig_Stack *stack);

struct Sig_Stack {
    int values[MAXSIZE];
    int top;

    int (*push)(Sig_Stack *, int);

    int *(*pop)(Sig_Stack *);
};

