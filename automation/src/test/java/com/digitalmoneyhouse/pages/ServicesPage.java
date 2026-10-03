package com.digitalmoneyhouse.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class ServicesPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By searchInput = By.cssSelector("input[placeholder*='Buscá']");
    private final By serviceItems = By.xpath("//div[contains(@class, 'cursor-pointer') or contains(@class, 'service-item')]");
    private final By accountNumberInput = By.cssSelector("input[placeholder*='11 dígitos'], input[type='text']");
    private final By continueButton = By.xpath("//button[contains(text(), 'Continuar')]");
    private final By payButton = By.xpath("//button[contains(text(), 'Pagar')]");
    private final By dineroEnCuentaRadio = By.cssSelector("input[value='account_money']");
    private final By successBanner = By.xpath("//*[contains(text(), 'Ya realizaste tu pago')]");
    private final By errorAccountBanner = By.xpath("//*[contains(text(), 'No encontramos facturas')]");
    private final By errorInsufficientFundsBanner = By.xpath("//*[contains(text(), 'Hubo un problema con tu pago')]");
    private final By downloadVoucherButton = By.xpath("//button[contains(text(), 'Descargar comprobante')]");

    public ServicesPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void navigateTo(String baseUrl) {
        driver.get(baseUrl + "/services");
        wait.until(ExpectedConditions.presenceOfElementLocated(searchInput));
    }

    public void searchService(String query) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(searchInput));
        input.clear();
        input.sendKeys(query);
    }

    public List<WebElement> getServiceItems() {
        return driver.findElements(serviceItems);
    }

    public void selectFirstService() {
        WebElement first = wait.until(ExpectedConditions.elementToBeClickable(serviceItems));
        first.click();
    }

    public void enterAccountNumber(String accountNumber) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(accountNumberInput));
        input.clear();
        input.sendKeys(accountNumber);
    }

    public void clickContinue() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(continueButton));
        btn.click();
    }

    public void selectDineroEnCuenta() {
        WebElement radio = wait.until(ExpectedConditions.presenceOfElementLocated(dineroEnCuentaRadio));
        if (!radio.isSelected()) {
            radio.click();
        }
    }

    public void clickPay() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(payButton));
        btn.click();
    }

    public boolean isSuccessBannerDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(successBanner)).isDisplayed();
    }

    public boolean isAccountErrorDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(errorAccountBanner)).isDisplayed();
    }

    public boolean isInsufficientFundsErrorDisplayed() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(errorInsufficientFundsBanner)).isDisplayed();
    }

    public void clickDownloadVoucher() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(downloadVoucherButton));
        btn.click();
    }
}
