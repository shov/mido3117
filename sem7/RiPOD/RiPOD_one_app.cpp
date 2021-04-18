#include <iostream>
#include "./include/CAZ.h"

IUnknown* CreateInstance() {
	IUnknown* pUn = static_cast<IX*>(new CA);
	pUn->AddRef();
	return pUn;
}

int main()
{
	std::cout << "Started" << std::endl;

	HRESULT r;
	void* component = nullptr;

	IUnknown* pUn = CreateInstance();

	// IX
	r = pUn->QueryInterface(static_cast<REFIID>(IID_IX), &component);

	if (S_OK != r || component == nullptr) {
		std::cerr << "Cannot receive IX!" << std::endl;
		return -1;
	}

	// Test IX
	long expected_XRay = 42;
	long result_XRay;

	r = (static_cast<CA*>(component))->XRay(&result_XRay);

	if (S_OK != r) {
		std::cerr << "IX::XRay() unexpected return code:  0x" << std::hex << r << std::endl;
		return -1;
	}

	if (expected_XRay != result_XRay) {
		std::cerr << "IX::XRay() unexpected result: " << result_XRay << std::endl;
		return -1;
	}

	std::cout << "IX::XRay() pass OK: " << result_XRay << std::endl;

	(static_cast<IUnknown*>(component))->Release();

	// IY
	r = pUn->QueryInterface(static_cast<REFIID>(IID_IY), &component);

	if (S_OK != r || component == nullptr) {
		std::cerr << "Cannot receive IY!" << std::endl;
		return -1;
	}

	// Test IY
	long expected_YSo = 13;
	long result_YSo;

	r = (static_cast<CA*>(component))->YSo(&result_YSo);

	if (S_OK != r) {
		std::cerr << "IY::YSo() unexpected return code:  0x" << std::hex << r << std::endl;
		return -1;
	}

	if (expected_YSo != result_YSo) {
		std::cerr << "IY::YSo() unexpected result: " << result_YSo << std::endl;
		return -1;
	}

	std::cout << "IY::YSo() pass OK: " << result_YSo << std::endl;

	(static_cast<IUnknown*>(component))->Release();

	// IZ
	r = pUn->QueryInterface(static_cast<REFIID>(IID_IZ), &component);

	if (S_OK == r) {
		std::cerr << "Unexpected receiving IZ!" << std::endl;
		return -1;
	}

	std::cout << "Attempt to get IZ implementation returned: 0x" << std::hex << r << std::endl;

	// Refs 

	ULONG refs = pUn->Release();
	if (0 != refs) {
		std::cerr << "Unexpected refs counter value" << std::endl;
		return -1;
	}

	std::cout << "Released all refs! Done!" << std::endl;

	std::cin.get();
}