-- First make time and description nullable
ALTER TABLE public.calendar_events ALTER COLUMN time DROP NOT NULL;
ALTER TABLE public.calendar_events ALTER COLUMN description DROP NOT NULL;

-- Update existing events to prevent constraint violations
UPDATE public.calendar_events 
SET event_type = CASE 
    WHEN event_type = 'Quiz' THEN 'Exam'
    WHEN event_type = 'Homework Due' THEN 'Event'
    WHEN event_type = 'Project' THEN 'Event'
    WHEN event_type = 'Assignment' THEN 'Event'
    ELSE event_type
END;

-- Update event type constraint
ALTER TABLE public.calendar_events DROP CONSTRAINT IF EXISTS calendar_events_event_type_check;
ALTER TABLE public.calendar_events ADD CONSTRAINT calendar_events_event_type_check 
  CHECK (event_type IN ('Exam', 'Event'));
