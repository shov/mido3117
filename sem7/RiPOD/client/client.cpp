#include <windows.h>
#include <tchar.h>
#include <iostream.h>

#include <initguid.h>
#include "../include/imath.h"


int main( int argc, char *argv[] )
{
    cout << "Initializing COM" << endl;

    if ( FAILED( CoInitialize( 0 )))
    {
        cout << "Unable to initialize COM" << endl;
        return -1;
    }

    const char* szProgID = "MIDO.RIPOD.Math.1";
    WCHAR  szWideProgID[128];
    CLSID  clsid;
    long lLen = MultiByteToWideChar( CP_ACP,
                                     0,
                                     szProgID,
                                     strlen( szProgID ),
                                     szWideProgID,
                                     sizeof( szWideProgID ) );

    szWideProgID[ lLen ] = '\0';
    HRESULT hr = ::CLSIDFromProgID( szWideProgID, &clsid );
    if ( FAILED( hr ))
    {
        cout.setf( ios::hex, ios::basefield );
        cout << "Unable to get CLSID from ProgID. HR = " << hr << endl;
        return -1;
    }

    IClassFactory* pCF;

    hr = CoGetClassObject( clsid,
                           CLSCTX_INPROC,
                           0,
                           IID_IClassFactory,
                           (void**) &pCF );
    if ( FAILED( hr ))
    {
        cout.setf( ios::hex, ios::basefield );
        cout << "Failed to GetClassObject server instance. HR = " << hr << endl;
        return -1;
    }

    IUnknown* pUnk;
    hr = pCF->CreateInstance( 0, IID_IUnknown, (void**) &pUnk );

    pCF->Release();

    if ( FAILED( hr ))
    {
        cout.setf( ios::hex, ios::basefield );
        cout << "Failed to create server instance. HR = " << hr << endl;
        return -1;
    }

    cout << "Instance created" << endl;

    IMath* pMath = nullptr;
    hr = pUnk->QueryInterface( IID_IMath, (LPVOID*)&pMath );
    pUnk->Release();
    if ( FAILED( hr ))
    {
        cout << "QueryInterface() for IMath failed" << endl;
        return -1;
    }

    long result;
    pMath->Multiply( 100, 8, &result );
    cout << "100 * 8 is " << result << endl;

    pMath->Subtract( 1000, 333, &result );
    cout << "1000 - 333 is " << result << endl;

    cout << "Releasing instance" << endl;
    pMath->Release();

    cout << "Shuting down COM" << endl;
    CoUninitialize();

    return 0;
}