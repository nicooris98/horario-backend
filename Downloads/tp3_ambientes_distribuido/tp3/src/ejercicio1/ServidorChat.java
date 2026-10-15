package ejercicio1;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashSet;
import java.util.Set;

public class ServidorChat {
    private static final int PUERTO = 5000;
    private static Set<ManejadorCliente> clientesConectados = new HashSet<>();

    public static void main(String[] args) {
        System.out.println("Iniciando servidor de chat en el puerto " + PUERTO + "...");
        try (ServerSocket serverSocket = new ServerSocket(PUERTO)) {
            while (true) {
                Socket socketCliente = serverSocket.accept();
                System.out.println("¡Nuevo cliente conectado desde " + socketCliente.getInetAddress() + "!");
                ManejadorCliente manejador = new ManejadorCliente(socketCliente, clientesConectados);
                clientesConectados.add(manejador);
                new Thread(manejador).start();
            }
        } catch (IOException e) {
            System.err.println("Error en el servidor: " + e.getMessage());
        }
    }
}
