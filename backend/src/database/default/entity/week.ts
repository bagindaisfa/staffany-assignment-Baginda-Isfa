import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, Timestamp } from "typeorm";
import { IsDateString } from 'class-validator';
import Shift from "./shift";

@Entity()
export default class Week {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'date' })
  @IsDateString()
  startDate: string;

  @Column({ type: 'date' })
  @IsDateString()
  endDate: string;

  @Column({ default: false })
  isPublished: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  publishedAt: Date;

  @OneToMany(() => Shift, shift => shift.week)
  shifts: Shift[];

  // Helper method to check if a date falls within this week
  containsDate(date: Date): boolean {
    const d = new Date(date);
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    // Set end date to end of day
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  }

  // Get the week's Monday date (start of week)
  static getWeekStartDate(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  // Get the week's Sunday date (end of week)
  static getWeekEndDate(date: Date): Date {
    const start = Week.getWeekStartDate(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  // Create a new Week instance for a given date
  static createForDate(date: Date): Week {
    const week = new Week();
    const start = Week.getWeekStartDate(date);
    const end = Week.getWeekEndDate(date);
    
    week.startDate = start.toISOString().split('T')[0];
    week.endDate = end.toISOString().split('T')[0];
    week.isPublished = false;
    
    return week;
  }
}
