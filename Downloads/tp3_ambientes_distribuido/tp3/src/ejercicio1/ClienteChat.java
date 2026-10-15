package ejercicio1;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

public class ClienteChat {
    private static final String SERVIDOR = "127.0.0.1";
    private static final int PUERTO = 5000;

    public static void main(String[] args) {
        try {
            Socket socket = new Socket(SERVIDOR, PUERTO);
            BufferedReader entradaServidor = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter salidaServidor = new PrintWriter(socket.getOutputStream(), true);
            BufferedReader teclado = new BufferedReader(new InputStreamReader(System.in));

            // Hilo para escuchar mensajes del servidor en tiempo real
            new Thread(() -> {
                try {
                    String msg;
                    while ((msg = entradaServidor.readLine()) != null) {
                        System.out.println(msg);
                    }
                } catch (IOException e) {
                    System.out.println("Conexión cerrada por el servidor.");
                }
            }).start();

            // Leer de consola y enviar al servidor
            String userInput;
            while ((userInput = teclado.readLine()) != null) {
                salidaServidor.println(userInput);
                if (userInput.equalsIgnoreCase("SALIR")) {
                    break;
                }
            }
            socket.close();
        } catch (IOException e) {
            System.err.println("No se pudo conectar al servidor: " + e.getMessage());
        }
    }
}
