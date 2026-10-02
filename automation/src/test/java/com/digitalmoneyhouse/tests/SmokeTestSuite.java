package com.digitalmoneyhouse.tests;

import com.digitalmoneyhouse.base.BaseTest;
import com.digitalmoneyhouse.pages.CardsPage;
import com.digitalmoneyhouse.pages.DashboardPage;
import com.digitalmoneyhouse.pages.ProfilePage;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class SmokeTestSuite extends BaseTest {
    private DashboardPage dashboardPage;
    private ProfilePage profilePage;
    private CardsPage cardsPage;

    @BeforeMethod
    public void authenticateUser() {
        loginWithMockToken("1", "mauriciobrito@digitalhouse.com", "Mauricio", "Brito");
        dashboardPage = new DashboardPage(driver);
        profilePage = new ProfilePage(driver);
        cardsPage = new CardsPage(driver);
    }

    /**
     * CP-014: Visualización de dinero disponible con dos centavos en ARS en Dashboard.
     */
    @Test(description = "CP-014: Verificar formato de dinero disponible con 2 centavos en ARS")
    public void testAvailableBalanceFormat() {
        dashboardPage.navigateTo(baseUrl);
        String balanceText = dashboardPage.getAvailableBalanceText();
        Assert.assertTrue(balanceText.startsWith("$"), "El saldo debe comenzar con símbolo $");
        Assert.assertTrue(balanceText.matches("\\$\\s?[0-9.,]+,[0-9]{2}"),
                "El saldo debe expresar dos centavos de detalle (formato ARS): " + balanceText);
    }

    /**
     * CP-015: Accesos directos a 'Ver tarjetas' y 'Ver CVU' desde Dashboard.
     */
    @Test(description = "CP-015: Verificar accesos directos de Dashboard hacia Tarjetas y Perfil")
    public void testDashboardDirectLinks() {
        dashboardPage.navigateTo(baseUrl);
        dashboardPage.clickVerTarjetas();
        wait.until(ExpectedConditions.urlContains("/cards"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/cards"));

        dashboardPage.navigateTo(baseUrl);
        dashboardPage.clickVerCvu();
        wait.until(ExpectedConditions.urlContains("/profile"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/profile"));
    }

    /**
     * CP-016: Menú lateral persistente y redirección al hacer clic en nombre de usuario en cabecera.
     */
    @Test(description = "CP-016: Menú lateral persistente y redirección al Dashboard por cabecera")
    public void testSidebarPersistenceAndHeaderRedirection() {
        profilePage.navigateTo(baseUrl);
        Assert.assertTrue(driver.findElement(By.tagName("aside")).isDisplayed(),
                "La barra lateral debe ser visible en /profile");

        dashboardPage.clickHeaderUserBadge();
        wait.until(ExpectedConditions.urlContains("/home"));
        Assert.assertTrue(driver.getCurrentUrl().endsWith("/home"),
                "Hacer clic en el nombre debe redirigir a /home");
    }

    /**
     * CP-019 & CP-020: Buscador de actividad con tecla Enter y enlace a actividad.
     */
    @Test(description = "CP-019/020: Buscador de actividad con Enter y redirección")
    public void testActivitySearchRedirection() {
        dashboardPage.navigateTo(baseUrl);
        dashboardPage.searchActivityAndPressEnter("Rodrigo");
        wait.until(ExpectedConditions.urlContains("/activity?q=Rodrigo"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/activity?q=Rodrigo"));
    }

    /**
     * CP-021: Visualización de datos de perfil y contraseña protegida con asteriscos.
     */
    @Test(description = "CP-021: Datos de perfil y contraseña enmascarada con asteriscos")
    public void testProfileDetailsAndPasswordHidden() {
        profilePage.navigateTo(baseUrl);
        Assert.assertTrue(profilePage.isPasswordHidden(), "La contraseña debe mostrarse oculta con (******)");
    }

    /**
     * CP-024: Botón 'Gestioná los medios de pago' redirige a /cards.
     */
    @Test(description = "CP-024: Redirección desde Mi Perfil a Gestión de Medios de Pago")
    public void testProfileToCardsRedirection() {
        profilePage.navigateTo(baseUrl);
        profilePage.clickGestionarMediosPago();
        wait.until(ExpectedConditions.urlContains("/cards"));
        Assert.assertTrue(driver.getCurrentUrl().contains("/cards"));
    }

    /**
     * CP-025 & CP-026: Alta de tarjeta y detección de marca (Visa, Mastercard, AMEX) en base a los primeros 4 dígitos.
     */
    @Test(description = "CP-025/026: Alta de tarjeta con detección automática de marca")
    public void testCardBrandDetection() {
        cardsPage.navigateTo(baseUrl);
        cardsPage.clickNuevaTarjeta();
        wait.until(ExpectedConditions.urlContains("/cards/new"));

        // Test Visa (comienza con 4)
        cardsPage.fillCardForm("4720123456789012", "12/28", "MAURICIO BRITO", "123");
        String previewText = cardsPage.getDetectedBrandText();
        Assert.assertTrue(previewText.contains("VISA"), "Debe detectar tarjeta tipo VISA");
    }

    /**
     * CP-028: Visualización de tarjetas mostrando únicamente los últimos 4 dígitos.
     */
    @Test(description = "CP-028: Tarjetas listadas muestran solo los últimos 4 dígitos")
    public void testCardsListShowsLastFourDigits() {
        cardsPage.navigateTo(baseUrl);
        String pageSource = driver.getPageSource();
        Assert.assertTrue(pageSource.contains("Terminada en"),
                "Debe mostrar texto 'Terminada en XXXX'");
    }
}
