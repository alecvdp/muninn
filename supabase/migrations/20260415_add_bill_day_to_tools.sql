alter table tools add column if not exists bill_day integer;

comment on column tools.bill_day is 'Day of month (1-31) for monthly billing. Used to auto-compute next renewal date.';
