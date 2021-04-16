#include "../../include/imath.h"

#ifndef RIPOD_MATH_H
#define RIPOD_MATH_H

extern long g_lObjs;
extern long g_lLocks;


class Math : public IMath {
public:
    Math();

    ~Math();

    // IUnknown
    STDMETHOD(QueryInterface(REFIID, void * *));

    STDMETHOD_(ULONG, AddRef());

    STDMETHOD_(ULONG, Release());

    // IMath
    STDMETHOD(Add(long, long, long * ));

    STDMETHOD(Substract(long, long, long * ));

    STDMETHOD(Multiply(long, long, long * ));

    STDMETHOD(Divide(long, long, long * ));

protected:
    long m_lRef;
};

class MathClassFactory : public IClassFactory {
public:
    MathClassFactory();

    ~MathClassFactory();

    // IUnknown
    STDMETHOD(QueryInterface(REFIID, void * *));

    STDMETHOD_(ULONG, AddRef());

    STDMETHOD_(ULONG, Release());

    // IClassFactory
    STDMETHOD(CreateInstance(LPUNKNOWN, REFIID, void * *));

    STDMETHOD(LockServer(BOOL));

protected:
    long m_lRef;
};

#endif //RIPOD_MATH_H
