import { DataSource } from 'typeorm';
import { ScheduleOverlapService } from './schedule-overlap.service';

describe('ScheduleOverlapService', () => {
  const dataSource = { query: jest.fn() };
  const service = new ScheduleOverlapService(
    dataSource as unknown as DataSource,
  );

  beforeEach(() => jest.clearAllMocks());

  it('ejecuta el SQL de solapamiento y devuelve los conflictos', async () => {
    const conflicts = [
      {
        idDocenteEfectivo: 1,
        nombreDocente: 'Ana',
        apellidoDocente: 'Gómez',
        idHorarioExistente: 9,
        idEccdOrigen: 10,
        conflictoDesde: '2026-04-01',
        conflictoHasta: null,
      },
    ];
    dataSource.query.mockResolvedValue(conflicts);

    const result = await service.checkOverlap({
      idEccd: 10,
      idDia: 3,
      idHoraCatedra: 2,
      fechaDesde: '2026-03-01',
      fechaHasta: '2026-06-30',
    });

    expect(result).toBe(conflicts);
    expect(dataSource.query).toHaveBeenCalledTimes(1);
    const [sql, params] = dataSource.query.mock.calls[0];
    expect(sql).toContain('schedule_windows');
    expect(params).toEqual([10, 3, 2, '2026-03-01', '2026-06-30', null, null]);
  });

  it('pasa excludeIdHorario e idDocente cuando se proveen', async () => {
    dataSource.query.mockResolvedValue([]);

    await service.checkOverlap({
      idEccd: 10,
      idDia: 3,
      idHoraCatedra: 2,
      fechaDesde: '2026-03-01',
      fechaHasta: null,
      excludeIdHorario: 5,
      idDocente: 7,
    });

    expect(dataSource.query.mock.calls[0][1]).toEqual([
      10, 3, 2, '2026-03-01', null, 5, 7,
    ]);
  });
});
