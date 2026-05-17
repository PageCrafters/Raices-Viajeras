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
selenium.open("http://localhost:5173/")
selenium.click("xpath=//main[@id='contenido-principal']/div/section/div")
selenium.click("link=Conocenos")
selenium.click("link=Cerrar sesión")
selenium.click("link=Iniciar sesión")
selenium.click("link=Blog")
selenium.click("link=Blog")
selenium.click("link=Inicio")
selenium.click("xpath=//div[@id='rv-header-root']/header/nav/div/a/span")
selenium.click("xpath=//div[@id='rv-header-root']/header/nav/div/a/span")
selenium.click("id=btn_registrarse")
selenium.click("xpath=//div[@id='navMenu']/ul/li/button/i")
selenium.click("xpath=//div[@id='navMenu']/ul/li/button/i")
selenium.click("link=Iniciar sesión")
selenium.click("link=Viajes")
selenium.click("link=Conócenos")
selenium.click("xpath=//div[@id='root']/header/nav/div/a/span")
selenium.open("http://localhost:5173/")
selenium.click("link=Apúntate hoy")
selenium.click("link=Blog")
selenium.click("xpath=//ul[@id='lista-categorias']/li[2]")
selenium.click("xpath=//div[@id='noticias-container']/div[2]/div/div[2]/div[2]/div/a")
selenium.click("xpath=//div[@id='navMenu']/ul/li/button")
selenium.click("xpath=//div[@id='navMenu']/ul/li[5]/button/i")
selenium.click("link=Explorar viajes")
selenium.click("xpath=//div[@id='provincias-wrap']/div[2]/div/div[2]/a")
selenium.click("xpath=//div[@id='viajes-wrap']/div[2]/div/div[2]/div[2]/div/button")
selenium.click("xpath=//div[@id='viajes-wrap']/div[2]/div/div[2]/div[2]/div/a")
selenium.click("xpath=//div[@id='navMenu']/ul/li/button")
selenium.click("xpath=//div[@id='navMenu']/ul/li[5]/button/span")
selenium.click("xpath=//div[@id='root']/div/div/div/div[2]/div/div[2]/article/div/div/button")
selenium.click("xpath=//div[@id='root']/div/div/div/div/button")
