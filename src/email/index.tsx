import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Img,
    Preview,
    Text,
  } from "@react-email/components";
  import * as React from "react";
  
  interface EmailProps {
    userFirstname: string;
  }
  const NotionWaitlistEmail = ({ userFirstname }: EmailProps) => (
    <Html>
      <Head />
      <Preview>Welcome to the Waitlist, {userFirstname}! ✨</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`/greenleaf.png`}
            width="220"
            height="100"
            alt="Perfect Waitlist Logo"
            style={logo}
          />
          <Text style={greeting}>Hello {userFirstname},</Text>
          <Text style={paragraph}>
            Thank you for joining our exclusive waitlist! We're thrilled to have you as part of our growing community of early adopters.
          </Text>
          <Text style={paragraph}>
            We're putting the finishing touches on something special and you'll be among the first to know when we launch. Your interest means the world to us as we work to create the best possible experience.
          </Text>
          <Text style={paragraph}>
            Have questions or ideas? I'd love to hear from you! Simply reply to{" "}
            <a href="mailto:abhishek.gusain1007fb@gmail.com" style={link}>
              this email
            </a>{" "}
            and I'll personally get back to you.
          </Text>
          <Text style={paragraph}>
            Stay in the loop with our latest updates:{" "}
            <a href="https://twitter.com/abhishekgusain_" style={link}>
              @abhishekgusain_
            </a>
          </Text>
          <Text style={signOff}>
            Warm regards,
            <br />
            Abhishek Gusain
            <br />
            <span style={title}>Founder</span>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            You're receiving this because you signed up for our waitlist. 
            Not interested? No problem, you can unsubscribe anytime.
          </Text>
        </Container>
      </Body>
    </Html>
  );
  
  export default NotionWaitlistEmail;
  
  NotionWaitlistEmail.PreviewProps = {
    userFirstname: "Tyler",
  } as EmailProps;
  
  
  const main = {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    fontFamily: 'figtree, "Helvetica Neue", Helvetica, Arial, sans-serif',
    padding: "40px 0",
    color: "#ffffff",
  };
  
  const container = {
    margin: "0 auto",
    padding: "24px 32px 48px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(17, 153, 142, 0.16)",
    maxWidth: "600px",
  };
  
  const logo = {
    margin: "0 auto",
    paddingBottom: "20px",
  };
  
  const greeting = {
    fontSize: "20px",
    lineHeight: "28px",
    fontWeight: "700",
    color: "#11998e",
    marginBottom: "16px",
  };
  
  const paragraph = {
    fontSize: "16px",
    lineHeight: "26px",
    marginBottom: "20px",
    color: "#333333",
  };
  
  const link = {
    color: "#11998e",
    textDecoration: "underline",
    fontWeight: "500",
  };
  
  const signOff = {
    fontSize: "16px",
    lineHeight: "26px",
    marginTop: "30px",
    color: "#333333",
  };
  
  const hr = {
    borderColor: "#e6f9f7",
    margin: "20px 0",
    height: "1px",
  };
  
  const footer = {
    color: "#777777",
    fontSize: "12px",
  };
  
  const title = {
    fontSize: "14px",
    color: "#11998e",
    marginTop: "4px",
    fontWeight: "500",
  };
  