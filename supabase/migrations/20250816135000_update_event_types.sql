-- Update calendar_events table to allow only 'Exam' and 'Event' types
alter table calendar_events drop constraint if exists calendar_events_event_type_check;
alter table calendar_events add constraint calendar_events_event_type_check 
  check (event_type in ('Exam', 'Event'));
