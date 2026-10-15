package ejercicio1;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Set;

public class ManejadorCliente implements Runnable {
    private Socket socket;
    private Set<ManejadorCliente> clientesConectados;
    private PrintWriter out;
    private BufferedReader in;
    private String nombreCliente;

    public ManejadorCliente(Socket socket, Set<ManejadorCliente> clientesConectados) {
        this.socket = socket;
        this.clientesConectados = clientesConectados;
    }

    @Override
    public void run() {
        try {
            in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            out = new PrintWriter(socket.getOutputStream(), true);

            out.println("Ingresa tu nombre de usuario:");
            nombreCliente = in.readLine();
            broadcast(nombreCliente + " se ha unido al chat.", this);

            String mensaje;
            while ((mensaje = in.readLine()) != null) {
                if (mensaje.equalsIgnoreCase("SALIR")) {
                    break;
                }
                broadcast(nombreCliente + ": " + mensaje, this);
            }
        } catch (IOException e) {
            System.out.println("Error en la conexión con " + nombreCliente + ": " + e.getMessage());
        } finally {
            desconectar();
        }
    }

    public void enviarMensaje(String mensaje) {
        out.println(mensaje);
    }

    private void broadcast(String mensaje, ManejadorCliente remitente) {
        synchronized (clientesConectados) {
            for (ManejadorCliente cliente : clientesConectados) {
                if (cliente != remitente) {
                    cliente.enviarMensaje(mensaje);
                }
            }
        }
    }

    private void desconectar() {
        clientesConectados.remove(this);
        try {
            if (socket != null) socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        broadcast(nombreCliente + " ha abandonado el chat.", this);
        System.out.println(nombreCliente + " se desconectó.");
    }
}