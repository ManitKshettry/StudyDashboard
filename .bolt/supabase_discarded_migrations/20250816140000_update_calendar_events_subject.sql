-- Make subject optional for events
ALTER TABLE public.calendar_events ALTER COLUMN subject DROP NOT NULL;

-- Update event type check constraint
ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_event_type_check 
  CHECK (event_type IN ('Exam', 'Event'));

-- Add check constraint to ensure subject is required for exams
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_exam_subject_check
  CHECK (
    CASE 
      WHEN event_type = 'Exam' THEN subject IS NOT NULL AND subject <> ''
      ELSE true
    END
  );
