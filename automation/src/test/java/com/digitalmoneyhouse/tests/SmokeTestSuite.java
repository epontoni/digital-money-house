package com.digitalmoneyhouse.tests;

import com.digitalmoneyhouse.base.BaseTest;
import com.digitalmoneyhouse.pages.*;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class SmokeTestSuite extends BaseTest {
    private DashboardPage dashboardPage;
    private ProfilePage profilePage;
    private CardsPage cardsPage;
    private DepositPage depositPage;
    private ActivityPage activityPage;
    private ActivityDetailPage activityDetailPage;
    private ServicesPage servicesPage;

    @BeforeMethod
    public void authenticateUser() {
        loginWithMockToken("1", "mauriciobrito@digitalhouse.com", "Mauricio", "Brito");
        dashboardPage = new DashboardPage(driver);
        profilePage = new ProfilePage(driver);
        cardsPage = new CardsPage(driver);
        depositPage = new DepositPage(driver);
        activityPage = new ActivityPage(driver);
        activityDetailPage = new ActivityDetailPage(driver);
        servicesPage = new ServicesPage(driver);
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
     * CP-025 & CP-026: Alta de tarjeta y detección de marca (Visa, Mastercard, AMEX) en base a los primeros 4 dígitos.
     */
    @Test(description = "CP-025/026: Alta de tarjeta con detección automática de marca")
    public void testCardBrandDetection() {
        cardsPage.navigateTo(baseUrl);
        cardsPage.clickNuevaTarjeta();
        wait.until(ExpectedConditions.urlContains("/cards/new"));

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

    /**
     * CP-031 & CP-035 & CP-036: Flujo completo de ingreso de dinero con tarjeta y comprobante.
     */
    @Test(description = "CP-031/035/036: Carga de dinero con tarjeta, revisión y comprobante")
    public void testCardDepositWorkflow() {
        depositPage.navigateTo(baseUrl);
        depositPage.selectCardMethod();
        depositPage.continueWithSelectedCard();
        depositPage.enterAmountAndContinue("500");
        depositPage.confirmReview();

        Assert.assertTrue(depositPage.isDepositSuccessBannerDisplayed(),
                "Debe mostrarse el banner 'Ya cargamos el dinero en tu cuenta'");
    }

    /**
     * CP-037: Visualización y copiado de CVU y Alias en carga externa.
     */
    @Test(description = "CP-037: Consulta y copiado de CVU y Alias en carga por cuenta externa")
    public void testExternalTransferCredentials() {
        depositPage.navigateTo(baseUrl);
        depositPage.selectExternalTransferMethod();
        depositPage.clickCopyCvu();
        depositPage.clickCopyAlias();
        String pageSource = driver.getPageSource();
        Assert.assertTrue(pageSource.contains("Copia tu cvu o alias"),
                "Debe presentarse la pantalla de credenciales de transferencia");
    }

    /**
     * CP-038 & CP-040: Paginación y búsqueda por palabras clave en Mi Actividad.
     */
    @Test(description = "CP-038/040: Paginación cada 10 transacciones y buscador en actividad")
    public void testActivityPaginationAndSearch() {
        activityPage.navigateTo(baseUrl);
        Assert.assertTrue(activityPage.getActivityItems().size() <= 10,
                "Cada página debe contener un máximo de 10 transacciones");

        activityPage.searchKeyword("Rodrigo");
        Assert.assertTrue(driver.getPageSource().contains("Rodrigo"),
                "Debe filtrar transacciones relacionadas con Rodrigo");
    }

    /**
     * CP-045: Detalle de actividad con número de operación y estado Aprobada.
     */
    @Test(description = "CP-045: Detalle de transacción con número de operación y estado Aprobada")
    public void testActivityDetailView() {
        activityPage.navigateTo(baseUrl);
        activityPage.clickFirstActivity();
        wait.until(ExpectedConditions.urlMatches(".*/activity/act_.*"));

        Assert.assertTrue(activityDetailPage.isStatusApprovedDisplayed(),
                "El detalle debe exhibir estado '✓ Aprobada'");
    }

    /**
     * CP-046 & CP-048 & CP-050 & CP-052: Flujo de pago de servicios con dinero en cuenta.
     */
    @Test(description = "CP-046/048/050/052: Búsqueda, cuenta válida y pago exitoso de servicio")
    public void testPayServiceWithAccountMoneySuccess() {
        servicesPage.navigateTo(baseUrl);
        servicesPage.searchService("Edenor");
        servicesPage.selectFirstService();
        servicesPage.enterAccountNumber("37289701912");
        servicesPage.clickContinue();
        servicesPage.selectDineroEnCuenta();
        servicesPage.clickPay();

        Assert.assertTrue(servicesPage.isSuccessBannerDisplayed(),
                "Debe mostrarse el banner 'Ya realizaste tu pago'");
    }

    /**
     * CP-049: Validación de cuenta de servicio errónea / sin facturas.
     */
    @Test(description = "CP-049: Error al ingresar cuenta no válida que inicia con 2")
    public void testPayServiceAccountValidationError() {
        servicesPage.navigateTo(baseUrl);
        servicesPage.selectFirstService();
        servicesPage.enterAccountNumber("27289701912");
        servicesPage.clickContinue();

        Assert.assertTrue(servicesPage.isAccountErrorDisplayed(),
                "Debe mostrarse pantalla de error 'No encontramos facturas asociadas a este dato'");
    }
}

