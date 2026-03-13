import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { i18n } from 'src/i18n';
import { RRule, Frequency, rrulestr } from 'rrule';
import yupFormSchemas from 'src/modules/shared/yup/yupFormSchemas';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import TextAreaFormItem from 'src/view/shared/form/items/TextAreaFormItem';
import FormWrapper from 'src/view/shared/styles/FormWrapper';
import * as yup from 'yup';

const FREQ_OPTIONS = [
  { value: '', label: i18n('entities.scheduledEvent.fields.rruleFreqNone') },
  { value: 'DAILY', label: i18n('entities.scheduledEvent.enumerators.rruleFreq.DAILY') },
  { value: 'WEEKLY', label: i18n('entities.scheduledEvent.enumerators.rruleFreq.WEEKLY') },
  { value: 'MONTHLY', label: i18n('entities.scheduledEvent.enumerators.rruleFreq.MONTHLY') },
  { value: 'YEARLY', label: i18n('entities.scheduledEvent.enumerators.rruleFreq.YEARLY') },
  { value: 'HOURLY', label: i18n('entities.scheduledEvent.enumerators.rruleFreq.HOURLY') },
];

const WEEKDAYS = [
  { value: 'MO', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.MO') },
  { value: 'TU', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.TU') },
  { value: 'WE', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.WE') },
  { value: 'TH', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.TH') },
  { value: 'FR', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.FR') },
  { value: 'SA', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.SA') },
  { value: 'SU', label: i18n('entities.scheduledEvent.enumerators.rruleWeekday.SU') },
];

const FREQ_MAP: Record<string, Frequency> = {
  DAILY: Frequency.DAILY,
  WEEKLY: Frequency.WEEKLY,
  MONTHLY: Frequency.MONTHLY,
  YEARLY: Frequency.YEARLY,
  HOURLY: Frequency.HOURLY,
};

const BYDAY_MAP: Record<string, any> = {
  MO: RRule.MO,
  TU: RRule.TU,
  WE: RRule.WE,
  TH: RRule.TH,
  FR: RRule.FR,
  SA: RRule.SA,
  SU: RRule.SU,
};

const WEEKDAY_VALUES = WEEKDAYS.map((weekday) => weekday.value);

const FREQ_MAP_REVERSE = Object.entries(FREQ_MAP).reduce(
  (acc, [name, freq]) => {
    acc[freq] = name;
    return acc;
  },
  {} as Record<number, string>,
);

const toCsv = (value: number[] | number | null | undefined) => {
  if (value === null || value === undefined) {
    return '';
  }

  return (Array.isArray(value) ? value : [value]).join(',');
};

const toDatetimeLocalValue = (dateLike: Date | string | number | null | undefined) => {
  if (!dateLike) {
    return '';
  }

  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizeByweekday = (value: any): string[] => {
  const days = Array.isArray(value)
    ? value
    : value
      ? [value]
      : [];

  return days
    .map((day) => {
      const text = String(day).toUpperCase();
      return text.slice(-2);
    })
    .filter((day) => WEEKDAY_VALUES.includes(day));
};

const schema = yup.object().shape({
  title: yupFormSchemas.string(
    i18n('entities.scheduledEvent.fields.title'),
    { required: true },
  ),
  description: yupFormSchemas.string(
    i18n('entities.scheduledEvent.fields.description'),
    {},
  ),
  startDate: yupFormSchemas.string(
    i18n('entities.scheduledEvent.fields.startDate'),
    {},
  ),
  endDate: yupFormSchemas.string(
    i18n('entities.scheduledEvent.fields.endDate'),
    {},
  ),
  durationMinutes: yupFormSchemas.integer(
    i18n('entities.scheduledEvent.fields.durationMinutes'),
    { min: 1 },
  ),
  location: yupFormSchemas.string(
    i18n('entities.scheduledEvent.fields.location'),
    {},
  ),
  timezone: yupFormSchemas.string(
    i18n('entities.scheduledEvent.fields.timezone'),
    {},
  ),
});

const RRuleBuilder = ({ value, onChange, startDate }: { value: string; onChange: (v: string) => void; startDate?: string }) => {
  const [freq, setFreq] = useState('');
  const [interval, setInterval] = useState(1);
  const [endType, setEndType] = useState<'none' | 'count' | 'until'>('none');
  const [count, setCount] = useState(10);
  const [until, setUntil] = useState('');
  const [bydays, setBydays] = useState<string[]>([]);
  const [byhour, setByhour] = useState('');
  const [byminute, setByminute] = useState('');
  const [bysecond, setBysecond] = useState('');
  const [preview, setPreview] = useState('');
  const [isHydratedFromValue, setIsHydratedFromValue] = useState(false);

  // Parse a comma-separated string like "9,12,18" into [9, 12, 18]
  const parseInts = (val: string): number[] =>
    val
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

  useEffect(() => {
    if (isHydratedFromValue) {
      return;
    }

    if (!value) {
      setIsHydratedFromValue(true);
      return;
    }

    try {
      const parsedSet: any = rrulestr(value, { forceset: true });
      const firstRule =
        parsedSet?.rrules?.()[0] || parsedSet?._rrule?.[0] || null;
      const opts = firstRule?.origOptions || firstRule?.options;

      if (opts) {
        setFreq(FREQ_MAP_REVERSE[opts.freq] || '');
        setInterval(opts.interval || 1);
        setBydays(normalizeByweekday(opts.byweekday));
        setByhour(toCsv(opts.byhour));
        setByminute(toCsv(opts.byminute));
        setBysecond(toCsv(opts.bysecond));

        if (opts.count) {
          setEndType('count');
          setCount(opts.count);
          setUntil('');
        } else if (opts.until) {
          setEndType('until');
          setUntil(toDatetimeLocalValue(opts.until));
        } else {
          setEndType('none');
          setUntil('');
        }

        setPreview(firstRule?.toText?.() || '');
      }
    } catch (_) {
      // Keep defaults when RRULE cannot be parsed.
    } finally {
      setIsHydratedFromValue(true);
    }
  }, [value, isHydratedFromValue]);

  useEffect(() => {
    if (!isHydratedFromValue) {
      return;
    }

    if (!freq) {
      onChange('');
      setPreview('');
      return;
    }

    try {
      const opts: any = {
        freq: FREQ_MAP[freq],
        interval: interval || 1,
      };
      // Embed DTSTART so the RRule string carries the event's start time
      if (startDate) {
        opts.dtstart = new Date(startDate);
      }
      if (freq === 'WEEKLY' && bydays.length > 0) {
        opts.byweekday = bydays.map((d) => BYDAY_MAP[d]);
      }
      if (endType === 'count' && count > 0) {
        opts.count = count;
      }
      if (endType === 'until' && until) {
        opts.until = new Date(until);
      }
      const parsedHours = parseInts(byhour);
      if (parsedHours.length > 0) opts.byhour = parsedHours;
      const parsedMinutes = parseInts(byminute);
      if (parsedMinutes.length > 0) opts.byminute = parsedMinutes;
      const parsedSeconds = parseInts(bysecond);
      if (parsedSeconds.length > 0) opts.bysecond = parsedSeconds;
      const rule = new RRule(opts);
      const str = rule.toString();
      onChange(str);
      setPreview(rule.toText());
    } catch (_) {
      onChange('');
      setPreview('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [freq, interval, endType, count, until, bydays, startDate, byhour, byminute, bysecond, isHydratedFromValue]);

  const toggleDay = (day: string) => {
    setBydays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <div className="card mb-3">
      <div className="card-header">
        <strong>{i18n('entities.scheduledEvent.fields.rrule')}</strong>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">
              {i18n('entities.scheduledEvent.fields.rruleFreq')}
            </label>
            <select
              className="form-select"
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
            >
              {FREQ_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {freq && (
            <div className="col-md-3">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleInterval')}
              </label>
              <input
                type="number"
                className="form-control"
                min={1}
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
              />
            </div>
          )}

          {freq && (
            <div className="col-md-5">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleEnd')}
              </label>
              <select
                className="form-select"
                value={endType}
                onChange={(e) => setEndType(e.target.value as any)}
              >
                <option value="none">{i18n('entities.scheduledEvent.fields.rruleEndNone')}</option>
                <option value="count">{i18n('entities.scheduledEvent.fields.rruleEndCount')}</option>
                <option value="until">{i18n('entities.scheduledEvent.fields.rruleEndUntil')}</option>
              </select>
            </div>
          )}

          {freq && endType === 'count' && (
            <div className="col-md-4">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleCount')}
              </label>
              <input
                type="number"
                className="form-control"
                min={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              />
            </div>
          )}

          {freq && endType === 'until' && (
            <div className="col-md-5">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleUntil')}
              </label>
              <input
                type="datetime-local"
                className="form-control"
                value={until}
                onChange={(e) => setUntil(e.target.value)}
              />
            </div>
          )}

          {freq === 'WEEKLY' && (
            <div className="col-12">
              <label className="form-label d-block">
                {i18n('entities.scheduledEvent.fields.rruleByDay')}
              </label>
              <div className="d-flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <div key={day.value} className="form-check form-check-inline">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`byday-${day.value}`}
                      checked={bydays.includes(day.value)}
                      onChange={() => toggleDay(day.value)}
                    />
                    <label
                      className="form-check-label"
                      htmlFor={`byday-${day.value}`}
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* byhour — relevant for DAILY and above (which hours of the day) */}
          {freq && ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq) && (
            <div className="col-md-4">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleByHour')}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 9,12,18"
                value={byhour}
                onChange={(e) => setByhour(e.target.value)}
              />
              <div className="form-text">
                {i18n('entities.scheduledEvent.fields.rruleByHourHint')}
              </div>
            </div>
          )}

          {/* byminute — relevant for HOURLY and above */}
          {freq && ['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq) && (
            <div className="col-md-4">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleByMinute')}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 0,15,30,45"
                value={byminute}
                onChange={(e) => setByminute(e.target.value)}
              />
              <div className="form-text">
                {i18n('entities.scheduledEvent.fields.rruleByMinuteHint')}
              </div>
            </div>
          )}

          {/* bysecond — relevant for MINUTELY and above */}
          {freq && ['MINUTELY', 'HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq) && (
            <div className="col-md-4">
              <label className="form-label">
                {i18n('entities.scheduledEvent.fields.rruleBySecond')}
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 0,30"
                value={bysecond}
                onChange={(e) => setBysecond(e.target.value)}
              />
              <div className="form-text">
                {i18n('entities.scheduledEvent.fields.rruleBySecondHint')}
              </div>
            </div>
          )}

          {freq && preview && (
            <div className="col-12">
              <div className="alert alert-info py-2 mb-0">
                <small>
                  <strong>{i18n('entities.scheduledEvent.fields.rrulePreview')}:</strong>{' '}
                  {preview}
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScheduledEventForm = (props) => {
  const [rruleString, setRruleString] = useState(
    () => props.record?.rruleString || '',
  );

  const [initialValues] = useState(() => {
    const record = props.record || {};
    return {
      title: record.title || '',
      description: record.description || '',
      startDate: record.startDate ? record.startDate.slice(0, 16) : '',
      endDate: record.endDate ? record.endDate.slice(0, 16) : '',
      durationMinutes: record.durationMinutes ?? '',
      allDay: record.allDay || false,
      location: record.location || '',
      timezone: record.timezone || '',
    };
  });

  const form = useForm({
    resolver: yupResolver(schema as yup.AnyObjectSchema),
    mode: 'all',
    defaultValues: initialValues as any,
  });

  const startDateValue = useWatch({ control: form.control, name: 'startDate' });

  const onReset = () => {
    Object.keys(initialValues).forEach((key) => {
      form.setValue(key, initialValues[key]);
    });
    setRruleString(props.record?.rruleString || '');
  };

  const onSubmit = (values) => {
    const payload: any = { ...values };

    if (!payload.durationMinutes && payload.startDate && payload.endDate) {
      const startMs = new Date(payload.startDate).getTime();
      const endMs = new Date(payload.endDate).getTime();

      if (Number.isFinite(startMs) && Number.isFinite(endMs) && endMs > startMs) {
        payload.durationMinutes = Math.round((endMs - startMs) / (60 * 1000));
      }
    }

    if (payload.durationMinutes) {
      payload.durationMinutes = Number(payload.durationMinutes);
    }

    if (rruleString) {
      payload.rruleString = rruleString;
    }
    props.onSubmit(props?.record?.id, payload);
  };

  return (
    <FormWrapper>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="title"
                label={i18n('entities.scheduledEvent.fields.title')}
              />
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <TextAreaFormItem
                name="description"
                label={i18n('entities.scheduledEvent.fields.description')}
              />
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="mb-3">
                <label className="form-label">
                  {i18n('entities.scheduledEvent.fields.startDate')}
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...form.register('startDate')}
                />
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="mb-3">
                <label className="form-label">
                  {i18n('entities.scheduledEvent.fields.endDate')}
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  {...form.register('endDate')}
                />
              </div>
            </div>
            <div className="col-lg-2 col-md-6 col-12">
              <div className="mb-3">
                <label className="form-label">
                  {i18n('entities.scheduledEvent.fields.durationMinutes')}
                </label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  {...form.register('durationMinutes')}
                />
              </div>
            </div>
            <div className="col-lg-2 col-md-3 col-12 d-flex align-items-center pt-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="allDay"
                  {...form.register('allDay')}
                />
                <label className="form-check-label" htmlFor="allDay">
                  {i18n('entities.scheduledEvent.fields.allDay')}
                </label>
              </div>
            </div>
            <div className="col-lg-7 col-md-8 col-12">
              <InputFormItem
                name="location"
                label={i18n('entities.scheduledEvent.fields.location')}
              />
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <InputFormItem
                name="timezone"
                label={i18n('entities.scheduledEvent.fields.timezone')}
              />
            </div>
            <div className="col-12 mt-3">
              <RRuleBuilder
                value={rruleString}
                onChange={setRruleString}
                startDate={startDateValue}
              />
            </div>
          </div>

          <div className="form-buttons">
            <button
              className="btn btn-primary"
              disabled={props.saveLoading}
              type="button"
              onClick={form.handleSubmit(onSubmit)}
            >
              <ButtonIcon loading={props.saveLoading} iconClass="far fa-save" />{' '}
              {i18n('common.save')}
            </button>

            <button
              className="btn btn-light"
              type="button"
              disabled={props.saveLoading}
              onClick={onReset}
            >
              <i className="fas fa-undo"></i>{' '}
              {i18n('common.reset')}
            </button>

            {props.onCancel ? (
              <button
                className="btn btn-light"
                type="button"
                disabled={props.saveLoading}
                onClick={() => props.onCancel()}
              >
                <i className="fas fa-times"></i>{' '}
                {i18n('common.cancel')}
              </button>
            ) : null}
          </div>
        </form>
      </FormProvider>
    </FormWrapper>
  );
};

export default ScheduledEventForm;
