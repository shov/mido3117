#pragma once

// {033c780b-24f8-47ba-982e-4ec19f7e2b1a}
DEFINE_GUID(IID_IZ,
    0x033c780b, 0x24f8, 0x47ba, 0x98, 0x2e, 0x4e, 0xc1, 0x9f, 0x7e, 0x2b, 0x1a);

class IZ : public IUnknown {
public:
    STDMETHOD(Zelda(long*))PURE;
};