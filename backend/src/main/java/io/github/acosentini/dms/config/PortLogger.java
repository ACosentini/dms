package io.github.acosentini.dms.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.context.ServletWebServerInitializedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.Enumeration;

@Component
public class PortLogger implements ApplicationListener<ServletWebServerInitializedEvent> {

    private static final Logger logger = LoggerFactory.getLogger(PortLogger.class);

    @Value("${server.port:8080}")
    private int configuredPort;

    @Value("${PORT:not-set}")
    private String envPort;

    @Override
    public void onApplicationEvent(ServletWebServerInitializedEvent event) {
        int actualPort = event.getWebServer().getPort();
        
        logger.info("====== PORT BINDING INFORMATION ======");
        logger.info("Configured port in properties: {}", configuredPort);
        logger.info("PORT environment variable: {}", envPort);
        logger.info("Actual server port: {}", actualPort);
        logger.info("Server is listening on 0.0.0.0:{}", actualPort);
        logger.info("====================================");
        
        // Log all network interfaces for debugging
        try {
            logger.info("Network interfaces:");
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                logger.info("Interface: {}", networkInterface.getDisplayName());
                
                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    logger.info("  Address: {}", address.getHostAddress());
                }
            }
        } catch (SocketException e) {
            logger.error("Error getting network interfaces", e);
        }
    }
} 