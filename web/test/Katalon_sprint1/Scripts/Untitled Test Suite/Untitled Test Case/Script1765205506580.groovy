import static com.kms.katalon.core.checkpoint.CheckpointFactory.findCheckpoint
import static com.kms.katalon.core.testcase.TestCaseFactory.findTestCase
import static com.kms.katalon.core.testdata.TestDataFactory.findTestData
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import com.kms.katalon.core.checkpoint.Checkpoint as Checkpoint
import com.kms.katalon.core.checkpoint.CheckpointFactory as CheckpointFactory
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as MobileBuiltInKeywords
import com.kms.katalon.core.model.FailureHandling as FailureHandling
import com.kms.katalon.core.testcase.TestCase as TestCase
import com.kms.katalon.core.testcase.TestCaseFactory as TestCaseFactory
import com.kms.katalon.core.testdata.TestData as TestData
import com.kms.katalon.core.testdata.TestDataFactory as TestDataFactory
import com.kms.katalon.core.testobject.ObjectRepository as ObjectRepository
import com.kms.katalon.core.testobject.TestObject as TestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WSBuiltInKeywords
import com.kms.katalon.core.webui.driver.DriverFactory as DriverFactory
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUiBuiltInKeywords
import internal.GlobalVariable as GlobalVariable
import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import com.kms.katalon.core.mobile.keyword.MobileBuiltInKeywords as Mobile
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import com.kms.katalon.core.testobject.SelectorMethod

import com.thoughtworks.selenium.Selenium
import org.openqa.selenium.firefox.FirefoxDriver
import org.openqa.selenium.WebDriver
import com.thoughtworks.selenium.webdriven.WebDriverBackedSelenium
import static org.junit.Assert.*
import java.util.regex.Pattern
import static org.apache.commons.lang3.StringUtils.join
import org.testng.asserts.SoftAssert
import com.kms.katalon.core.testdata.CSVData
import org.openqa.selenium.Keys as Keys

SoftAssert softAssertion = new SoftAssert();
WebUI.openBrowser('https://www.google.com/')
def driver = DriverFactory.getWebDriver()
String baseUrl = "https://www.google.com/"
selenium = new WebDriverBackedSelenium(driver, baseUrl)
selenium.open("http://localhost:63342/Raices-Viajeras2/web/index.html?_ijt=cb1cp7m8b2ec67a8ombf6gntgj&_ij_reload=RELOAD_ON_SAVE#tit-form")
selenium.click("id=navMenu")
selenium.click("link=Ñ")
selenium.click("link=Ñ")
selenium.click("link=Apúntate hoy")
selenium.click("id=nombre")
selenium.type("id=nombre", ("Ana López").toString())
selenium.type("id=correo", ("analopezdeahumada97@gmail.com").toString())
selenium.click("id=contrasenia")
selenium.type("id=contrasenia", ("Qammar4553#").toString())
selenium.click("id=confirmar_contrasenia")
selenium.type("id=confirmar_contrasenia", ("qammar4553#").toString())
selenium.click("xpath=//button[@type='submit']")
selenium.click("id=tipo_viaje")
selenium.select("id=tipo_viaje", "label=Aventura")
selenium.click("xpath=//button[@type='submit']")
selenium.click("id=politica_privacidad")
selenium.click("id=politica_privacidad")
selenium.click("id=politica_privacidad")
selenium.click("id=notificaciones")
selenium.click("xpath=//button[@type='submit']")
selenium.click("id=nombre")
selenium.type("id=nombre", "A")
selenium.click("id=correo")
selenium.click("id=nombre")
selenium.type("id=nombre", "")
selenium.click("id=correo")
selenium.click("id=correo")
selenium.type("id=correo", ("analopezdeahumada97gmail.com").toString())
selenium.click("id=contrasenia")
selenium.type("id=contrasenia", "Qam")
selenium.click("id=confirmar_contrasenia")
selenium.type("id=confirmar_contrasenia", "qamma")
selenium.click("xpath=//button[@type='submit']")
