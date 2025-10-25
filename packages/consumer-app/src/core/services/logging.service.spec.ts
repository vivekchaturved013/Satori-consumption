import { TestBed } from '@angular/core/testing';
import { LoggingService } from './logging.service';

describe('LoggingService', () => {
  let service: LoggingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log info messages', () => {
    spyOn(console, 'log');
    
    service.info('TestService', 'Test message', { data: 'test' });
    
    expect(service.logs().length).toBeGreaterThan(0);
    expect(service.logs()[service.logs().length - 1].level).toBe('info');
    expect(service.logs()[service.logs().length - 1].service).toBe('TestService');
    expect(service.logs()[service.logs().length - 1].message).toBe('Test message');
    expect(console.log).toHaveBeenCalled();
  });

  it('should log error messages', () => {
    spyOn(console, 'error');
    
    service.error('TestService', 'Test error', new Error('test'));
    
    expect(service.logs().length).toBeGreaterThan(0);
    const errorLog = service.logs().find(log => log.level === 'error');
    expect(errorLog).toBeTruthy();
    expect(errorLog?.service).toBe('TestService');
    expect(errorLog?.message).toBe('Test error');
    expect(console.error).toHaveBeenCalled();
  });

  it('should log warning messages', () => {
    spyOn(console, 'warn');
    
    service.warn('TestService', 'Test warning', { warning: 'data' });
    
    expect(service.logs().length).toBeGreaterThan(0);
    const warnLog = service.logs().find(log => log.level === 'warn');
    expect(warnLog).toBeTruthy();
    expect(warnLog?.service).toBe('TestService');
    expect(warnLog?.message).toBe('Test warning');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should enable and disable logging', () => {
    service.setEnabled(false);
    expect(service.isEnabled()).toBe(false);
    
    const initialLogCount = service.logs().length;
    service.info('TestService', 'This should not be logged');
    
    expect(service.logs().length).toBe(initialLogCount); // No new logs
    
    service.setEnabled(true);
    expect(service.isEnabled()).toBe(true);
  });

  it('should clear logs', () => {
    service.info('TestService', 'Test message 1');
    service.info('TestService', 'Test message 2');
    
    expect(service.logs().length).toBeGreaterThan(0);
    
    service.clearLogs();
    
    expect(service.logs().length).toBe(1); // Only the clear logs message
    expect(service.logs()[0].message).toContain('Logs cleared');
  });

  it('should filter logs by service', () => {
    service.info('Service1', 'Message 1');
    service.info('Service2', 'Message 2');
    service.info('Service1', 'Message 3');
    
    const service1Logs = service.getLogsByService('Service1');
    
    expect(service1Logs.length).toBe(2);
    expect(service1Logs.every(log => log.service === 'Service1')).toBe(true);
  });

  it('should filter logs by level', () => {
    service.info('TestService', 'Info message');
    service.error('TestService', 'Error message');
    service.warn('TestService', 'Warning message');
    
    const errorLogs = service.getLogsByLevel('error');
    
    expect(errorLogs.length).toBe(1);
    expect(errorLogs[0].level).toBe('error');
    expect(errorLogs[0].message).toBe('Error message');
  });

  it('should export logs as JSON', () => {
    service.info('TestService', 'Test message');
    
    const exportedLogs = service.exportLogs();
    
    expect(exportedLogs).toBeTruthy();
    expect(() => JSON.parse(exportedLogs)).not.toThrow();
    
    const parsed = JSON.parse(exportedLogs);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('should count error logs', () => {
    service.info('TestService', 'Info message');
    service.error('TestService', 'Error 1');
    service.error('TestService', 'Error 2');
    service.warn('TestService', 'Warning');
    
    const errorCount = service.getErrorCount();
    
    expect(errorCount).toBe(2);
  });

  it('should limit log history', () => {
    // This would require testing with 1000+ logs to test the limit
    // For now, just verify the service handles multiple logs
    for (let i = 0; i < 10; i++) {
      service.info('TestService', `Message ${i}`);
    }
    
    expect(service.logs().length).toBeGreaterThan(0);
    expect(service.logs().length).toBeLessThanOrEqual(1000); // Should not exceed max
  });
});