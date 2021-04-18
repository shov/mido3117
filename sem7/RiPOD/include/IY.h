#pragma once

// {56fe4527-938a-49ce-91df-31a3a27d0ce7}
DEFINE_GUID(IID_IY,
    0x56fe4527, 0x938a, 0x49ce, 0x91, 0xdf, 0x31, 0xa3, 0xa2, 0x7d, 0x0c, 0xe7);

class IY : public IUnknown {
public:
    STDMETHOD(YSo(long*))PURE;
};