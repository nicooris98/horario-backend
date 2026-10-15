package ejercicio2;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.SocketTimeoutException;

public class ServidorUDP {
    private static final int PUERTO = 6000;

    public static void main(String[] args) {
        System.out.println("Iniciando receptor de alertas UDP en el puerto " + PUERTO + "...");
        try (DatagramSocket socket = new DatagramSocket(PUERTO)) {
            socket.setSoTimeout(5000); // Timeout de 5 segundos como pide el TP[cite: 1, 2]
            byte[] buffer = new byte[1024];

            while (true) {
                DatagramPacket paquete = new DatagramPacket(buffer, buffer.length);
                try {
                    socket.receive(paquete);
                    String mensaje = new String(paquete.getData(), 0, paquete.getLength());
                    System.out.println("[ALERTA RECIBIDA] " + mensaje);
                } catch (SocketTimeoutException e) {
                    System.out.println("[ADVERTENCIA] No se recibió ningún datagrama en 5 segundos. Continuando escucha...");
                }
            }
        } catch (Exception e) {
            System.err.println("Error en el servidor UDP: " + e.getMessage());
        }
    }
}