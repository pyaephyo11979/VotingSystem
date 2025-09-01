package org.example.apibridge.error;

import org.example.apibridge.dto.response.StandardResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.rmi.RemoteException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RemoteException.class)
    public ResponseEntity<StandardResponse<Void>> handleRemote(RemoteException ex){
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(StandardResponse.fail("REMOTE_ERROR", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<StandardResponse<Void>> handleIllegal(IllegalArgumentException ex){
        return ResponseEntity.badRequest()
                .body(StandardResponse.fail("BAD_REQUEST", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<StandardResponse<Void>> handleValidation(MethodArgumentNotValidException ex){
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField()+": "+fe.getDefaultMessage())
                .findFirst().orElse("Validation error");
        return ResponseEntity.badRequest()
                .body(StandardResponse.fail("VALIDATION_ERROR", msg));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<StandardResponse<Void>> handleGeneric(Exception ex){
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(StandardResponse.fail("INTERNAL_ERROR", ex.getMessage()));
    }
}
