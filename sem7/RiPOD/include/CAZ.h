#pragma once

#include "windows.h"
#include <initguid.h>
#include "IX.h"
#include "IY.h"
#include "IZ.h"

// {720ffc95-2729-4095-a6ef-84b74a3392da}
DEFINE_GUID(CLSID_CA,
    0x720ffc95, 0x2729, 0x4095, 0xa6, 0xef, 0x84, 0xb7, 0x4a, 0x33, 0x92, 0xda);


class CA : public IX, public IY {
public:
    CA();

    // IUnknown
    STDMETHOD(QueryInterface(REFIID, void**));

    STDMETHOD_(ULONG, AddRef());

    STDMETHOD_(ULONG, Release());

    // IX
    STDMETHOD(XRay(long*));

    // IY
    STDMETHOD(YSo(long*));

protected:
    long m_lRef;
};


// {5b0f28f7-25df-45e8-81f5-0ac60b680350}
DEFINE_GUID(CLSID_Z,
    0x5b0f28f7, 0x25df, 0x45e8, 0x81, 0xf5, 0x0a, 0xc6, 0x0b, 0x68, 0x03, 0x50);

class Z : public IZ {
public:
    Z();

    // IUnknown
    STDMETHOD(QueryInterface(REFIID, void**));

    STDMETHOD_(ULONG, AddRef());

    STDMETHOD_(ULONG, Release());

    // IZ
    STDMETHOD(Zelda(long*));

protected:
    long m_lRef;
};