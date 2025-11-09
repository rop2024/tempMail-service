export class PollingService {
    constructor() {
        this.intervals = new Map();
        this.callbacks = new Map();
        this.defaultInterval = 15000; // 15 seconds
    }

    /**
     * Start polling for an email address
     * @param {string} address - Email address to poll
     * @param {Function} callback - Callback function when new data is received
     * @param {number} interval - Polling interval in milliseconds
     */
    startPolling(address, callback, interval = this.defaultInterval) {
        // Stop existing polling for this address
        this.stopPolling(address);

        // Store the callback
        this.callbacks.set(address, callback);

        // Initial fetch
        callback();

        // Start interval
        const intervalId = setInterval(() => {
            callback();
        }, interval);

        this.intervals.set(address, intervalId);

        console.log(`📡 Started polling for ${address} every ${interval}ms`);
    }

    /**
     * Stop polling for an email address
     * @param {string} address - Email address to stop polling
     */
    stopPolling(address) {
        const intervalId = this.intervals.get(address);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(address);
            this.callbacks.delete(address);
            console.log(`🛑 Stopped polling for ${address}`);
        }
    }

    /**
     * Update polling interval for an address
     * @param {string} address - Email address
     * @param {number} newInterval - New interval in milliseconds
     */
    updatePollingInterval(address, newInterval) {
        const callback = this.callbacks.get(address);
        if (callback) {
            this.stopPolling(address);
            this.startPolling(address, callback, newInterval);
        }
    }

    /**
     * Stop all polling
     */
    stopAllPolling() {
        for (const [address, intervalId] of this.intervals) {
            clearInterval(intervalId);
            console.log(`🛑 Stopped polling for ${address}`);
        }
        this.intervals.clear();
        this.callbacks.clear();
    }

    /**
     * Get current polling status
     * @returns {Object} Polling status
     */
    getStatus() {
        const status = {};
        for (const [address, intervalId] of this.intervals) {
            status[address] = {
                active: true,
                interval: this.getIntervalDuration(intervalId)
            };
        }
        return status;
    }

    /**
     * Get interval duration (for status display)
     * @param {number} intervalId - Interval ID
     * @returns {number} Interval duration in ms
     */
    getIntervalDuration(intervalId) {
        // This is a simplified implementation
        // In a real app, you might want to track the actual interval duration
        return this.defaultInterval;
    }

    /**
     * Check if an address is being polled
     * @param {string} address - Email address
     * @returns {boolean} Whether polling is active
     */
    isPolling(address) {
        return this.intervals.has(address);
    }
}

// Create and export singleton instance
export const pollingService = new PollingService();