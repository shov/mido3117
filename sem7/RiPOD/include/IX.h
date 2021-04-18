#pragma once

// {ac2ef887-14fc-4c05-a231-ad08e91bf628}
DEFINE_GUID(IID_IX,
    0xac2ef887, 0x14fc, 0x4c05, 0xa2, 0x31, 0xad, 0x08, 0xe9, 0x1b, 0xf6, 0x28);

class IX : public IUnknown {
public:
	STDMETHOD(XRay(long*))PURE;
};