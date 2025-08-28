/**
 * Session Recovery Utility
 * Handles automatic session recovery and prevents frequent access denied errors
 */

class SessionRecovery {
    constructor() {
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 10000; // 10 seconds
        this.isRecovering = false;
    }

    /**
     * Attempt to recover the session by refreshing the token
     */
    async attemptRecovery() {
        if (this.isRecovering || this.retryAttempts >= this.maxRetries) {
            return false;
        }

        this.isRecovering = true;
        this.retryAttempts++;

        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                return false;
            }

            // Try to refresh the token
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.accessToken);

                // Reset retry attempts on success
                this.retryAttempts = 0;
                this.isRecovering = false;

                console.log('Session recovery successful');
                return true;
            } else {
                console.log(`Session recovery attempt ${this.retryAttempts} failed`);
                return false;
            }
        } catch (error) {
            console.log(`Session recovery attempt ${this.retryAttempts} failed with error:`, error.message);
            return false;
        } finally {
            this.isRecovering = false;
        }
    }

    /**
     * Schedule the next recovery attempt
     */
    scheduleNextAttempt() {
        if (this.retryAttempts < this.maxRetries) {
            setTimeout(() => {
                this.attemptRecovery();
            }, this.retryDelay);
        }
    }

    /**
     * Reset the recovery state
     */
    reset() {
        this.retryAttempts = 0;
        this.isRecovering = false;
    }

    /**
     * Check if recovery is possible
     */
    canRecover() {
        return this.retryAttempts < this.maxRetries && !this.isRecovering;
    }
}

// Create a singleton instance
const sessionRecovery = new SessionRecovery();

export default sessionRecovery;
