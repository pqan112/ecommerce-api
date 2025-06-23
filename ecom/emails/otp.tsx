import React from 'react'
import { Body, Container, Head, Heading, Html, Img, Section, Text } from '@react-email/components'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant'
interface OTPEmailProps {
  otpCode: string
  title: string
  type: TypeOfVerificationCodeType
}

export const OTPEmail = ({ otpCode, title, type }) => {
  const renderHeading = () => {
    switch (type) {
      case TypeOfVerificationCode.REGISTER:
        return 'Enter OTP code to verify email before registration.'
      case TypeOfVerificationCode.LOGIN:
        return 'Enter OTP code to login'
      case TypeOfVerificationCode.FORGOT_PASSWORD:
        return 'Enter OTP code to reset your password'
      case TypeOfVerificationCode.DISABLE_2FA:
        return 'Enter OTP code to disable 2FA'
      default:
        return
    }
  }

  return (
    <Html>
      <Head>
        <title>{title}</title>
      </Head>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://nestjs.com/logo-small-gradient.d792062c.svg"
            width="212"
            height="88"
            alt="Logo"
            style={logo}
          />
          <Text style={tertiary}>OTP verification</Text>
          <Heading style={secondary}>{renderHeading()}</Heading>
          <Section style={codeContainer}>
            <Text style={code}>{otpCode}</Text>
          </Section>
          <Text style={paragraph}>Please ignore this email if you didn't verify email on our website</Text>
        </Container>
        <Text style={footer}>Securely powered by Sọp pe.</Text>
      </Body>
    </Html>
  )
}

OTPEmail.PreviewProps = {
  otpCode: '144833',
  title: 'We have sent you an OTP code for registration. Please do not share this code with others',
} as OTPEmailProps

export default OTPEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20,50,70,.2)',
  marginTop: '20px',
  maxWidth: '360px',
  margin: '0 auto',
  padding: '68px 0 130px',
}

const logo = {
  margin: '0 auto',
  borderRadius: '50%',
  height: '60px',
  width: '60px',
}

const tertiary = {
  color: '#0a85ea',
  fontSize: '11px',
  fontWeight: 700,
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  height: '16px',
  letterSpacing: '0',
  lineHeight: '16px',
  margin: '16px 8px 8px 8px',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
}

const secondary = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Medium,Helvetica,Arial,sans-serif',
  fontSize: '20px',
  fontWeight: 500,
  lineHeight: '24px',
  marginBottom: '0',
  marginTop: '0',
  textAlign: 'center' as const,
}

const codeContainer = {
  background: 'rgba(0,0,0,.05)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '280px',
}

const code = {
  color: '#000',
  display: 'inline-block',
  fontFamily: 'HelveticaNeue-Bold',
  fontSize: '32px',
  fontWeight: 700,
  letterSpacing: '6px',
  lineHeight: '40px',
  paddingBottom: '8px',
  paddingTop: '8px',
  margin: '0 auto',
  width: '100%',
  textAlign: 'center' as const,
}

const paragraph = {
  color: '#444',
  fontSize: '15px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  letterSpacing: '0',
  lineHeight: '23px',
  padding: '0 40px',
  margin: '0',
  textAlign: 'center' as const,
}

const link = {
  color: '#444',
  textDecoration: 'underline',
}

const footer = {
  color: '#000',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0',
  lineHeight: '23px',
  margin: '0',
  marginTop: '20px',
  fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
}
