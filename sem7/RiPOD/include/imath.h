#include "removeme.h"

#ifndef RIPOD_IMATH_H
#define RIPOD_IMATH_H

// {c995ea73-0f48-44f2-9260-3f89656c4adf}
DEFINE_GUID(CLSID_Math,
            0xc995ea73, 0x0f48, 0x44f2, 0x92, 0x60, 0x3f, 0x89, 0x65, 0x6c, 0x4a, 0xdf);

// {03deb3fd-21c8-4e50-8e6f-e1cd0c0bbafb}
DEFINE_GUID(IID_IMath,
            0x03deb3fd, 0x21c8, 0x4e50, 0x8e, 0x6f, 0xe1, 0xcd, 0x0c, 0x0b, 0xba, 0xfb);

class IMath : public IUnknown {
    STDMETHOD(Add(long, long, long * ))PURE;

    STDMETHOD(Subtract(long, long, long * ))PURE;

    STDMETHOD(Multiply(long, long, long * ))PURE;

    STDMETHOD(Divide(long, long, long * ))PURE;
};

#endif //RIPOD_IMATH_H
