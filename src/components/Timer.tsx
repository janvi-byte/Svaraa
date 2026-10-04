import { Clock3 } from 'lucide-react';
export function Timer({ value = '01:00' }: { value?: string }) { return <div className="timer"><Clock3 size={17} /><span>{value}</span></div>; }
