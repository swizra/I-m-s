package com.example.inventory.service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class CatalogLiveUpdateService {

    private final long timeoutMs;
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public CatalogLiveUpdateService(@Value("${app.live-updates.sse-timeout-ms:900000}") long timeoutMs) {
        this.timeoutMs = timeoutMs;
    }

    public SseEmitter subscribe() {
        SseEmitter emitter = new SseEmitter(timeoutMs);
        emitters.add(emitter);
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        emitter.onError(error -> emitters.remove(emitter));
        sendEvent(emitter, "connected", "stream-opened");
        return emitter;
    }

    public void publishCatalogRefresh(String reason) {
        emitters.forEach(emitter -> sendEvent(emitter, "catalog-refresh", reason));
    }

    private void sendEvent(SseEmitter emitter, String eventName, String reason) {
        try {
            emitter.send(SseEmitter.event()
                    .name(eventName)
                    .data(Map.of(
                            "event", eventName,
                            "reason", reason,
                            "updatedAt", LocalDateTime.now().toString()
                    )));
        } catch (IOException exception) {
            emitters.remove(emitter);
        }
    }
}
