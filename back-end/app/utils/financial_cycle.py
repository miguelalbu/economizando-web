import calendar
from datetime import date


def get_financial_cycle_range(reference_date: date, income_day: int) -> tuple[date, date]:
    """Calcula o início e fim do ciclo financeiro com base na data de referência e o dia de recebimento.

    Exemplo: income_day=15, reference_date=2024-06-20
    → cycle_start = 2024-06-15
    → cycle_end   = 2024-07-14
    """
    if reference_date.day >= income_day:
        cycle_start = date(reference_date.year, reference_date.month, income_day)
    else:
        # Ciclo ainda pertence ao mês anterior
        if reference_date.month == 1:
            cycle_start = date(reference_date.year - 1, 12, income_day)
        else:
            cycle_start = date(reference_date.year, reference_date.month - 1, income_day)

    # Fim do ciclo é um dia antes do início do próximo
    if cycle_start.month == 12:
        next_cycle_start = date(cycle_start.year + 1, 1, income_day)
    else:
        # Garante que o dia é válido no próximo mês
        next_month = cycle_start.month + 1
        next_year = cycle_start.year
        max_day = calendar.monthrange(next_year, next_month)[1]
        actual_day = min(income_day, max_day)
        next_cycle_start = date(next_year, next_month, actual_day)

    cycle_end = date(
        next_cycle_start.year,
        next_cycle_start.month,
        next_cycle_start.day - 1,
    )

    return cycle_start, cycle_end


def get_financial_month_label(reference_date: date, income_day: int) -> str:
    """Retorna o label do mês financeiro, ex: 'Junho/2024'."""
    start, _ = get_financial_cycle_range(reference_date, income_day)
    months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
    ]
    return f"{months[start.month - 1]}/{start.year}"
