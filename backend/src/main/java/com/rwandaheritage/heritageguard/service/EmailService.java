package com.rwandaheritage.heritageguard.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        try {
            log.info("Attempting to send email to: {}", to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Successfully sent email to: {}", to);
        } catch (MailException e) {
            log.error("Failed to send email to: {}. Error: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    public void sendVerificationEmail(String to, String token) {
        String verificationLink = frontendUrl + "/verify-email?token=" + token;
        String emailContent = String.format(
            "Hello,\n\n" +
            "Thank you for registering with Rwanda Heritage Guard. Please click the link below to verify your email address:\n\n" +
            "%s\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "If you did not create an account, please ignore this email.\n\n" +
            "Best regards,\n" +
            "Rwanda Heritage Guard Team",
            verificationLink
        );

        sendEmail(to, "Verify Your Email Address", emailContent);
    }

    public void sendPasswordResetEmail(String to, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        String emailContent = String.format(
            "Hello,\n\n" +
            "You have requested to reset your password. Please click the link below to reset your password:\n\n" +
            "%s\n\n" +
            "If you did not request a password reset, please ignore this email.\n\n" +
            "This link will expire in 24 hours.\n\n" +
            "Best regards,\n" +
            "Rwanda Heritage Guard Team",
            resetLink
        );

        sendEmail(to, "Password Reset Request", emailContent);
    }

    public void sendUnlockEmail(String to, String unlockLink) {
        String subject = "Unlock Your Rwanda Heritage Guard Account";
        String content = String.format("""
            <html>
            <body>
                <h2>Account Unlock Request</h2>
                <p>We received a request to unlock your Rwanda Heritage Guard account.</p>
                <p>If you did not make this request, please ignore this email.</p>
                <p>To unlock your account, click the link below:</p>
                <p><a href="%s">Unlock Account</a></p>
                <p>This link will expire in 24 hours.</p>
                <p>If you're having trouble clicking the link, copy and paste this URL into your browser:</p>
                <p>%s</p>
                <p>Best regards,<br>Rwanda Heritage Guard Team</p>
            </body>
            </html>
            """, unlockLink, unlockLink);

        sendEmail(to, subject, content);
        log.info("Unlock email sent to: {}", to);
    }
} 