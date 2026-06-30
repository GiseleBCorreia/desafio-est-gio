from dataclasses import dataclass, field
from typing import Literal
import uuid


AccountType = Literal["corrente", "poupanca"]

TARIFA_CORRENTE = 1.00
CHEQUE_ESPECIAL = 500.00


@dataclass
class Conta:
    tipo: AccountType
    titular: str
    saldo: float = 0.0
    id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])

    def to_dict(self):
        return {
            "id": self.id,
            "titular": self.titular,
            "tipo": self.tipo,
            "saldo": round(self.saldo, 2),
        }

    def sacar(self, valor: float) -> dict:
        if valor <= 0:
            raise ValueError("O valor do saque deve ser maior que zero.")

        if self.tipo == "corrente":
            total = valor + TARIFA_CORRENTE
            # saldo resultante não pode ser menor que -500
            if self.saldo - total < -CHEQUE_ESPECIAL:
                raise ValueError(
                    f"Saldo insuficiente. Limite do cheque especial: R$ {CHEQUE_ESPECIAL:.2f}. "
                    f"Saldo atual: R$ {self.saldo:.2f}. "
                    f"Total necessário (valor + tarifa R$1,00): R$ {total:.2f}."
                )
            self.saldo -= total
            return {
                "valor_sacado": round(valor, 2),
                "tarifa": TARIFA_CORRENTE,
                "saldo_atual": round(self.saldo, 2),
                "mensagem": "Saque realizado com sucesso.",
            }

        else:  # poupanca
            if self.saldo - valor < 0:
                raise ValueError(
                    f"Saldo insuficiente. Saldo atual: R$ {self.saldo:.2f}. "
                    f"Valor solicitado: R$ {valor:.2f}."
                )
            self.saldo -= valor
            return {
                "valor_sacado": round(valor, 2),
                "tarifa": 0.0,
                "saldo_atual": round(self.saldo, 2),
                "mensagem": "Saque realizado com sucesso.",
            }

    def transferir_para(self, destino: "Conta", valor: float) -> dict:
        if valor <= 0:
            raise ValueError("O valor da transferência deve ser maior que zero.")

        if self.tipo == "corrente":
            tarifa = TARIFA_CORRENTE
            total = valor + tarifa
            if self.saldo - total < -CHEQUE_ESPECIAL:
                raise ValueError(
                    f"Saldo insuficiente para transferência. "
                    f"Total necessário (valor + tarifa R$1,00): R$ {total:.2f}. "
                    f"Saldo atual: R$ {self.saldo:.2f}."
                )
            self.saldo -= total

        else:  # poupanca
            tarifa = 0.0
            total = valor
            if self.saldo - valor < 0:
                raise ValueError(
                    f"Saldo insuficiente. Saldo atual: R$ {self.saldo:.2f}. "
                    f"Valor solicitado: R$ {valor:.2f}."
                )
            self.saldo -= valor

        destino.saldo += valor

        return {
            "origem": self.titular,
            "destino": destino.titular,
            "valor_transferido": round(valor, 2),
            "tarifa": round(tarifa, 2),
            "valor_total_debitado": round(total, 2),
            "mensagem": "Transferência realizada com sucesso.",
        }