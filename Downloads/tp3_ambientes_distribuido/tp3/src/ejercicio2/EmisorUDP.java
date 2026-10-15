package ejercicio2;

import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class EmisorUDP {
    private static final String DESTINO = "127.0.0.1";
    private static final int PUERTO = 6000;

    public static void main(String[] args) {
        try (DatagramSocket socket = new DatagramSocket()) {
            InetAddress direccionDestino = InetAddress.getByName(DESTINO);
            String mensaje = "Alerta de telemetría: Sistema funcionando.";

            for (int i = 1; i <= 3; i++) {
                byte[] buffer = mensaje.getBytes();
                DatagramPacket paquete = new DatagramPacket(buffer, buffer.length, direccionDestino, PUERTO);
                socket.send(paquete);
                System.out.println("Mensaje UDP " + i + " enviado.");
                Thread.sleep(3000);
            }
        } catch (Exception e) {
            System.err.println("Error al enviar datagrama: " + e.getMessage());
        }
    }
}
