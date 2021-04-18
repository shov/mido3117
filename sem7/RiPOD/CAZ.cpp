#include "./include/CAZ.h"


// ------- CA --------

CA::CA() {
    m_lRef = 0;
}

// IUnknown

STDMETHODIMP CA::QueryInterface(REFIID riid, void** ppvObject) {
    *ppvObject = nullptr;

    if (riid == IID_IUnknown || riid == IID_IX || riid == IID_IY)
        *ppvObject = this;

    if (*ppvObject) {
        AddRef();
        return (S_OK);
    }
    return (E_NOINTERFACE);
}

STDMETHODIMP_(ULONG) CA::AddRef() {
    return InterlockedIncrement(&m_lRef);
}

STDMETHODIMP_(ULONG) CA::Release() {
    if (InterlockedDecrement(&m_lRef) == 0) {
        delete this;
        return 0;
    }

    return m_lRef;
}

// IX

STDMETHODIMP CA::XRay(long* pResult) {
    *pResult = 42;
    return S_OK;
}

// IY

STDMETHODIMP CA::YSo(long* pResult) {
    *pResult = 13;
    return S_OK;
}


// ------- Z --------

Z::Z() {
    m_lRef = 0;
}

// IUnknown

STDMETHODIMP Z::QueryInterface(REFIID riid, void** ppvObject) {
    *ppvObject = nullptr;

    if (riid == IID_IUnknown || riid == IID_IZ)
        *ppvObject = this;

    if (*ppvObject) {
        AddRef();
        return (S_OK);
    }
    return (E_NOINTERFACE);
}

STDMETHODIMP_(ULONG) Z::AddRef() {
    return InterlockedIncrement(&m_lRef);
}

STDMETHODIMP_(ULONG) Z::Release() {
    if (InterlockedDecrement(&m_lRef) == 0) {
        delete this;
        return 0;
    }

    return m_lRef;
}

// IZ

STDMETHODIMP Z::Zelda(long* pResult) {
    *pResult = 1000;
    return S_OK;
}