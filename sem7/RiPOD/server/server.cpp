#include <windows.h>

#include <initguid.h>
#include "./include/math.h"

long g_lObjs = 0;
long g_lLocks = 0;

STDAPI DllGetClassObject(REFCLSID rclsid, REFIID riid, void **ppvObject) {
    HRESULT hr;
    MathClassFactory *pCF;

    pCF = nullptr;

    if (rclsid != CLSID_Math)
        return (E_FAIL);

    pCF = new MathClassFactory;

    if (pCF == nullptr)
        return (E_OUTOFMEMORY);

    hr = pCF->QueryInterface(riid, ppvObject);

    if (FAILED(hr)) {
        delete pCF;
        pCF = nullptr;
    }

    return hr;
}

STDAPI DllCanUnloadNow(void) {
    if (g_lObjs || g_lLocks)
        return (S_FALSE);
    else
        return (S_OK);
}