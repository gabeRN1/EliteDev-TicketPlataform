import pytest 
import qrcode
from security import gerar_qr_code

def testar_geracao_qr_code():
    """ Testar a criação do qr code e visualizar o QR """
    ticket_id = 150
    evento_id = 42

    qr_code_str = gerar_qr_code(ticket_id, evento_id)

    print("\n" + "="*50)
    print(f"CONTEÚDO DO QR CODE: {qr_code_str}")
    print("="*50 + "\n")

    qr = qrcode.QRCode()
    qr.add_data(qr_code_str)
    qr.make(fit=True)
    
    
    print("ESCANEIE O QUADRADO ABAIXO:\n")
    qr.print_ascii()
    print("\n" + "="*50 + "\n")

    
    assert qr_code_str.startswith(f"qr-{ticket_id}-{evento_id}-")

    partes = qr_code_str.split("-")
    hash_gerado = partes[-1]
    assert len(hash_gerado) == 64

    qr_code_str_repetido = gerar_qr_code(ticket_id, evento_id)
    assert qr_code_str == qr_code_str_repetido

    qr_code_str_falso = gerar_qr_code(151, 42)
    assert qr_code_str != qr_code_str_falso