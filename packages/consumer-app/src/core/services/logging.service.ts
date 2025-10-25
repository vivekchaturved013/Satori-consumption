import { Injectable, signal } from '@angular/core';
import { ILogEntry } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private readonly _logs = signal<ILogEntry[]>([]);
  private readonly _isEnabled = signal<boolean>(true);
  
  // Public readonly signals
  public readonly logs = this._logs.asReadonly();
  public readonly isEnabled = this._isEnabled.asReadonly();

  constructor() {
    this.info('LoggingService', 'Logging service initialized');
  }

  /**
   * Log an info message
   */
  public info(service: string, message: string, data?: any): void {
    this.log('info', service, message, data);
  }

  /**
   * Log a warning message
   */
  public warn(service: string, message: string, data?: any): void {
    this.log('warn', service, message, data);
    console.warn(`[${service}] ${message}`, data);
  }

  /**
   * Log an error message
   */
  public error(service: string, message: string, error?: any): void {
    this.log('error', service, message, error);
    console.error(`[${service}] ${message}`, error);
  }

  /**
   * Log a debug message
   */
  public debug(service: string, message: string, data?: any): void {
    if (this._isEnabled()) {
      this.log('debug', service, message, data);
      console.debug(`[${service}] ${message}`, data);
    }
  }

  /**
   * Enable or disable logging
   */
  public setEnabled(enabled: boolean): void {
    this._isEnabled.set(enabled);
    this.info('LoggingService', `Logging ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Clear all logs
   */
  public clearLogs(): void {
    this._logs.set([]);
    this.info('LoggingService', 'Logs cleared');
  }

  /**
   * Get logs by service name
   */
  public getLogsByService(serviceName: string): ILogEntry[] {
    return this._logs().filter(log => log.service === serviceName);
  }

  /**
   * Get logs by level
   */
  public getLogsByLevel(level: 'info' | 'warn' | 'error' | 'debug'): ILogEntry[] {
    return this._logs().filter(log => log.level === level);
  }

  /**
   * Export logs as JSON
   */
  public exportLogs(): string {
    return JSON.stringify(this._logs(), null, 2);
  }

  /**
   * Get error count
   */
  public getErrorCount(): number {
    return this._logs().filter(log => log.level === 'error').length;
  }

  // Private methods
  private log(level: 'info' | 'warn' | 'error' | 'debug', service: string, message: string, data?: any): void {
    if (!this._isEnabled()) return;

    const entry: ILogEntry = {
      timestamp: new Date(),
      level,
      service,
      message,
      data
    };

    const currentLogs = this._logs();
    const maxLogs = 1000; // Keep only last 1000 logs
    const newLogs = [...currentLogs, entry].slice(-maxLogs);
    
    this._logs.set(newLogs);

    // Console output for development
    if (level === 'info') {
      console.log(`[${service}] ${message}`, data);
    }
  }
}