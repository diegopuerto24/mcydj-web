import "./globals.css";
import ChromeSwitch from "../components/ChromeSwitch";

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ChromeSwitch>{children}</ChromeSwitch>
      </body>
    </html>
  );
}
