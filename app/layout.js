import "./globals.css";

export const metadata = {
  title: "MC&DJ Consultores",
  description: "Despacho contable, fiscal y consultoría financiera."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
