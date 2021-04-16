#include <windows.h>
#include "./include/math.h"

Math::Math() {
    m_lRef = 0;
    InterlockedIncrement(&g_lObjs);
}

Math::~Math() {
    InterlockDecrement(&g_lObjs);
}

// IUnknown

STDMETHODIMP Math::QueryInterface(REFIID riid, void **ppvObject) {
    *ppvObject = nullptr;

    if (riid == IID_IUnknown || riid == IID_IMath)
        *ppvObject = this;

    if (*ppvObject) {
        AddRef();
        return (S_OK);
    }
    return (E_NOINTERFACE);
}

STDMETHODIMP_(ULONG) Math::AddRef() {
    return InterlockedIncrement(&m_lRef);
}

STDMETHODIMP_(ULONG) Math::Release() {
    if (InterlockedDecrement(&m_lRef) == 0) {
        delete this;
        return 0;
    }

    return m_lRef;
}

// IMath

STDMETHODIMP Math::Add(long lOp1, long lOp2, long *pResult) {
    *pResult = lOp1 + lOp2;
    return S_OK;
}

STDMETHODIMP Math::Subtract(long lOp1, long lOp2, long *pResult) {
    *pResult = lOp1 - lOp2;
    return S_OK;
}

STDMETHODIMP Math::Multiply(long lOp1, long lOp2, long *pResult) {
    *pResult = lOp1 * lOp2;
    return S_OK;
}

STDMETHODIMP Math::Divide(long lOp1, long lOp2, long *pResult) {
    *pResult = lOp1 / lOp2;
    return S_OK;
}

// MatchClassFactory

MathClassFactory::MathClassFactory() {
    m_lRef = 0;
}

MathClassFactory::~MathClassFactory() {
}

STDMETHODIMP MathClassFactory::QueryInterface(REFIID riid, void **ppvObject) {
    *ppvObject = 0;

    if (riid == IID_IUnknown || riid == IID_IClassFactory)
        *ppvObject = this;

    if (*ppvObject) {
        AddRef();
        return S_OK;
    }

    return (E_NOINTERFACE);
}

STDMETHODIMP_(ULONG) MathClassFactory::AddRef() {
    return InterlockedIncrement(&m_lRef);
}

STDMETHODIMP_(ULONG) MathClassFactory::Release() {
    if (InterlockedDecrement(&m_lRef) == 0) {
        delete this;
        return 0;
    }

    return m_lRef;
}

STDMETHODIMP MathClassFactory::CreateInstance
        (LPUNKNOWN pUnkOuter, REFIID riid, void **ppvObject) {
    Math *pMath;
    HRESULT hr;

    *ppvObject = nullptr;

    pMath = new Math;

    if (pMath == nullptr)
        return (E_OUTOFMEMORY);

    hr = pMath->QueryInterface(riid, ppvObject);

    if (FAILED(hr))
        delete pMath;

    return hr;
}

STDMETHODIMP MathClassFactory::LockServer(BOOL fLock) {
    if (fLock)
        InterlockedIncrement(&g_lLocks);
    else
        InterlockedDecrement(&g_lLocks);

    return S_OK;
}