import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { BaseTimestamp } from "./baseTimestamp";
import Week from "./week";

@Entity()
export default class Shift extends BaseTimestamp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "date",
  })
  date: string;

  @Column({
    type: "time",
    transformer: {
      to: (value: string) => value,        // raw string
      from: (value: string) => value       // raw string "HH:mm:ss"
    }
  })
  startTime: string;

  @Column({
    type: "time",
    transformer: {
      to: (value: string) => value,
      from: (value: string) => value
    }
  })
  endTime: string;

  @Column({ default: false })
  isPublished: boolean;

  @ManyToOne(() => Week, week => week.shifts, { nullable: true })
  @JoinColumn({ name: 'week_id' })
  week: Week;

  @Column({ name: 'week_id', nullable: true })
  weekId: string;

  // Helper methods for time calculations
  getStartDateTime(): Date {
    return new Date(`${this.date}T${this.startTime}`);
  }

  getEndDateTime(): Date {
    // If end time is before start time, it means it's the next day
    const endDate = new Date(`${this.date}T${this.endTime}`);
    const startDate = new Date(`${this.date}T${this.startTime}`);
    
    if (endDate < startDate) {
      // Add one day to the end date
      endDate.setDate(endDate.getDate() + 1);
    }
    
    return endDate;
  }

  // Check if this shift overlaps with another shift
  overlapsWith(other: Shift): boolean {
    const thisStart = this.getStartDateTime();
    const thisEnd = this.getEndDateTime();
    const otherStart = other.getStartDateTime();
    const otherEnd = other.getEndDateTime();

    return thisStart < otherEnd && thisEnd > otherStart;
  }
}
