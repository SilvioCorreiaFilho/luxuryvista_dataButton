import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  trigger: React.ReactNode;
}

export function ScheduleDialog({ trigger }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Agende sua Visita</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <iframe
            src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ0_vxJ2Hs-K4runEf9kn6kHT9EYTBZQXzeIgWY9CZzQvGQ0z9nndEtVQQHhFT8vz6n_Jt9f?gv=true"
            style={{ border: 0 }}
            width="100%"
            height="600"
            frameBorder="0"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
