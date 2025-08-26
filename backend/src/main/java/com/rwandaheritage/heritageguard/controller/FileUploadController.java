package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.dto.response.ApiResponse;
import com.rwandaheritage.heritageguard.validation.ValidationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final ValidationUtils validationUtils;

    @Value("${media.upload.dir:uploads/media}")
    private String mediaUploadDir;

    @Value("${document.upload.dir:uploads/documents}")
    private String documentUploadDir;

    // File type configurations
    private static final Map<String, List<String>> ALLOWED_FILE_EXTENSIONS = Map.of(
        "image", Arrays.asList("jpg", "jpeg", "png", "gif", "webp"),
        "document", Arrays.asList("pdf", "doc", "docx", "txt", "rtf"),
        "video", Arrays.asList("mp4", "avi", "mov", "mkv"),
        "audio", Arrays.asList("mp3", "wav", "flac", "aac"),
        "3d_model", Arrays.asList("obj", "stl", "ply", "gltf")
    );

    private static final Map<String, Long> MAX_FILE_SIZES = Map.of(
        "image", 10L * 1024 * 1024,      // 10MB
        "document", 10L * 1024 * 1024,   // 10MB
        "video", 100L * 1024 * 1024,     // 100MB
        "audio", 20L * 1024 * 1024,      // 20MB
        "3d_model", 50L * 1024 * 1024    // 50MB
    );

    /**
     * Upload a single file
     */
    @PostMapping("/upload/{fileType}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadFile(
            @PathVariable String fileType,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {

        try {
            // Validate file type
            if (!ALLOWED_FILE_EXTENSIONS.containsKey(fileType)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Invalid file type. Allowed types: " + String.join(", ", ALLOWED_FILE_EXTENSIONS.keySet()));
            }

            // Validate file
            validateFile(file, fileType);

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = generateUniqueFilename(originalFilename, fileExtension);

            // Determine upload directory
            String uploadDir = "image".equals(fileType) || "video".equals(fileType) || "audio".equals(fileType) || "3d_model".equals(fileType) 
                ? mediaUploadDir : documentUploadDir;

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Prepare response
            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("originalFilename", originalFilename);
            fileInfo.put("filename", uniqueFilename);
            fileInfo.put("filePath", filePath.toString());
            fileInfo.put("fileSize", file.getSize());
            fileInfo.put("fileType", fileType);
            fileInfo.put("contentType", file.getContentType());
            fileInfo.put("description", description);
            fileInfo.put("uploadDate", LocalDateTime.now());

            log.info("File uploaded successfully: {} -> {}", originalFilename, uniqueFilename);

            return ResponseEntity.ok(ApiResponse.success(fileInfo, "File uploaded successfully"));

        } catch (IOException e) {
            log.error("Failed to upload file: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file");
        }
    }

    /**
     * Upload multiple files
     */
    @PostMapping("/upload-multiple/{fileType}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER', 'CONTENT_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> uploadMultipleFiles(
            @PathVariable String fileType,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "description", required = false) String description) {

        try {
            if (files.length == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No files provided");
            }

            if (files.length > 10) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot upload more than 10 files at once");
            }

            List<Map<String, Object>> uploadedFiles = new ArrayList<>();

            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    // Validate and upload each file
                    validateFile(file, fileType);

                    String originalFilename = file.getOriginalFilename();
                    String fileExtension = getFileExtension(originalFilename);
                    String uniqueFilename = generateUniqueFilename(originalFilename, fileExtension);

                    String uploadDir = "image".equals(fileType) || "video".equals(fileType) || "audio".equals(fileType) || "3d_model".equals(fileType)
                        ? mediaUploadDir : documentUploadDir;

                    Path uploadPath = Paths.get(uploadDir);
                    if (!Files.exists(uploadPath)) {
                        Files.createDirectories(uploadPath);
                    }

                    Path filePath = uploadPath.resolve(uniqueFilename);
                    Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                    Map<String, Object> fileInfo = new HashMap<>();
                    fileInfo.put("originalFilename", originalFilename);
                    fileInfo.put("filename", uniqueFilename);
                    fileInfo.put("filePath", filePath.toString());
                    fileInfo.put("fileSize", file.getSize());
                    fileInfo.put("fileType", fileType);
                    fileInfo.put("contentType", file.getContentType());
                    fileInfo.put("description", description);
                    fileInfo.put("uploadDate", LocalDateTime.now());

                    uploadedFiles.add(fileInfo);
                }
            }

            log.info("Multiple files uploaded successfully: {} files", uploadedFiles.size());

            return ResponseEntity.ok(ApiResponse.success(uploadedFiles, 
                uploadedFiles.size() + " files uploaded successfully"));

        } catch (IOException e) {
            log.error("Failed to upload multiple files: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload files");
        }
    }

    /**
     * Download a file
     */
    @GetMapping("/download/{fileType}/{filename}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileType,
            @PathVariable String filename) {

        try {
            // Determine file directory
            String uploadDir = "image".equals(fileType) || "video".equals(fileType) || "audio".equals(fileType) || "3d_model".equals(fileType)
                ? mediaUploadDir : documentUploadDir;

            Path filePath = Paths.get(uploadDir).resolve(filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            // Determine content type
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (IOException e) {
            log.error("Failed to download file: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to download file");
        }
    }

    /**
     * Delete a file
     */
    @DeleteMapping("/delete/{fileType}/{filename}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMINISTRATOR', 'HERITAGE_MANAGER')")
    public ResponseEntity<ApiResponse<String>> deleteFile(
            @PathVariable String fileType,
            @PathVariable String filename) {

        try {
            String uploadDir = "image".equals(fileType) || "video".equals(fileType) || "audio".equals(fileType) || "3d_model".equals(fileType)
                ? mediaUploadDir : documentUploadDir;

            Path filePath = Paths.get(uploadDir).resolve(filename);

            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            Files.delete(filePath);
            log.info("File deleted successfully: {}", filename);

            return ResponseEntity.ok(ApiResponse.success("File deleted successfully"));

        } catch (IOException e) {
            log.error("Failed to delete file: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file");
        }
    }

    /**
     * Get file information
     */
    @GetMapping("/info/{fileType}/{filename}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFileInfo(
            @PathVariable String fileType,
            @PathVariable String filename) {

        try {
            String uploadDir = "image".equals(fileType) || "video".equals(fileType) || "audio".equals(fileType) || "3d_model".equals(fileType)
                ? mediaUploadDir : documentUploadDir;

            Path filePath = Paths.get(uploadDir).resolve(filename);

            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            Map<String, Object> fileInfo = new HashMap<>();
            fileInfo.put("filename", filename);
            fileInfo.put("fileSize", Files.size(filePath));
            fileInfo.put("fileType", fileType);
            fileInfo.put("contentType", Files.probeContentType(filePath));
            fileInfo.put("lastModified", Files.getLastModifiedTime(filePath).toInstant());
            fileInfo.put("readable", Files.isReadable(filePath));

            return ResponseEntity.ok(ApiResponse.success(fileInfo));

        } catch (IOException e) {
            log.error("Failed to get file info: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to get file information");
        }
    }

    /**
     * Get allowed file types and their configurations
     */
    @GetMapping("/config")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFileConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("allowedFileTypes", ALLOWED_FILE_EXTENSIONS.keySet());
        config.put("allowedExtensions", ALLOWED_FILE_EXTENSIONS);
        config.put("maxFileSizes", MAX_FILE_SIZES);

        return ResponseEntity.ok(ApiResponse.success(config));
    }

    // Helper methods

    private void validateFile(MultipartFile file, String fileType) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Filename is required");
        }

        // Validate file extension
        List<String> allowedExtensions = ALLOWED_FILE_EXTENSIONS.get(fileType);
        validationUtils.validateFileExtension(originalFilename, "File", allowedExtensions);

        // Validate file size
        Long maxSize = MAX_FILE_SIZES.get(fileType);
        if (maxSize != null) {
            validationUtils.validateFileSize(file.getSize(), "File", maxSize);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private String generateUniqueFilename(String originalFilename, String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String randomString = UUID.randomUUID().toString().substring(0, 8);
        String baseName = originalFilename.replaceFirst("\\.[^.]+$", "").replaceAll("[^a-zA-Z0-9._-]", "_");
        
        return String.format("%s_%s_%s.%s", baseName, timestamp, randomString, extension);
    }
}
