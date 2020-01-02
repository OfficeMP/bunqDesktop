import React from "react";
import { connect } from "react-redux";
import Helmet from "react-helmet";
import { translate } from "react-i18next";
import { ipcRenderer } from "electron";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import ArrowBackIcon from "@material-ui/icons/ArrowBack";

import TranslateTypography from "../../Components/TranslationHelpers/Typography";
import TranslateButton from "../../Components/TranslationHelpers/Button";
import ContactHeader from "./ContactHeader";

const remote = require("electron").remote;
const dialog = remote.dialog;
import {
    contactInfoUpdateGoogle,
    contactInfoUpdateApple,
    contactInfoUpdateOffice365,
    contactsClear,
    contactsSetInfoType
} from "../../Actions/contacts";
import { openSnackbar } from "../../Actions/snackbar";
const styles = {
    row: {
        marginBottom: 8
    },
    title: {
        margin: 16
    },
    button: {
        width: "100%"
    },
    logo: {
        width: 20,
        marginLeft: 16
    }
};

class Contacts extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            googleAccessToken: false,
            office365AccessToken: false,

            contacts: {}
        };

        ipcRenderer.on("received-oauth-google-access-token", this.handleGoogleCallback);
        ipcRenderer.on("received-oauth-office-365-access-token", this.handleOffice365Callback);
        ipcRenderer.on("received-oauth-failed", this.handleError);
    }

    handleError = event => {
        const failedMessage = this.props.t("Failed to validate the authentication tokens");

        this.props.openSnackbar(failedMessage);
    };

    openGoogleConsentScreen = event => {
        ipcRenderer.send("open-google-oauth");
    };
    handleGoogleCallback = (event, accessToken) => {
        this.setState({
            googleAccessToken: accessToken
        });
    };
    getGoogleContacts = event => {
        this.props.contactInfoUpdateGoogle(this.state.googleAccessToken);
    };

    getAppleContacts = event => {
        dialog.showOpenDialog(
            {
                properties: ["openFile"],
                filters: [{ name: "vCards", extensions: ["vcf"] }]
            },
            this.handleAppleFileChange
        );
    };
    handleAppleFileChange = filePaths => {
        if (filePaths && filePaths.length > 0) {
            this.props.contactInfoUpdateApple(filePaths);
        }
    };

    openOfficeConsentScreen = event => {
        ipcRenderer.send("open-office-365-oauth");
    };
    handleOffice365Callback = (event, accessToken) => {
        this.setState({
            office365AccessToken: accessToken
        });
    };
    getOfficeContacts = event => {
        this.props.contactInfoUpdateOffice365(this.state.office365AccessToken);
    };

    render() {
        const { t, contacts } = this.props;

        return (
            <Grid container spacing={8}>
                <Helmet>
                    <title>{`bunqDesktop - ${t("Contacts")}`}</title>
                </Helmet>

                <Grid item xs={12} sm={12} md={3} lg={4}>
                    <Button onClick={this.props.history.goBack}>
                        <ArrowBackIcon />
                    </Button>
                </Grid>

                <Grid item xs={12} sm={10} md={6} lg={4}>
                    <Grid container spacing={8} justify={"center"}>
                        <Grid item xs={8} md={9} style={styles.row}>
                            <TranslateTypography variant="h5">Contacts</TranslateTypography>
                        </Grid>

                        <Grid item xs={4} md={3} style={styles.row}>
                            <TranslateButton
                                variant="outlined"
                                color="secondary"
                                style={styles.button}
                                disabled={this.props.contactsLoading}
                                onClick={() => this.props.clearContacts()}
                            >
                                Clear all
                            </TranslateButton>
                        </Grid>

                        <Grid item xs={12} style={styles.row}>
                            <Paper>
                                <ContactHeader
                                    title="Google Contacts"
                                    contactType="GoogleContacts"
                                    logo="./images/google-logo.svg"
                                    canImport={!!this.state.googleAccessToken}
                                    loading={this.props.contactsLoading}
                                    clear={this.props.clearContacts}
                                    contacts={contacts}
                                    import={this.getGoogleContacts}
                                    login={this.openGoogleConsentScreen}
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={12} style={styles.row}>
                            <Paper>
                                <ContactHeader
                                    title="Apple Export"
                                    contactType="AppleContacts"
                                    logo="./images/apple-logo.svg"
                                    questionLink={
                                        "https://support.apple.com/guide/contacts/export-and-archive-contacts-adrbdcfd32e6/mac"
                                    }
                                    canImport={true}
                                    loading={this.props.contactsLoading}
                                    clear={this.props.clearContacts}
                                    contacts={contacts}
                                    import={this.getAppleContacts}
                                    login={() => {}}
                                />
                            </Paper>
                        </Grid>

                        <Grid item xs={12} style={styles.row}>
                            <Paper>
                                <ContactHeader
                                    title="Office 365"
                                    contactType="Office365"
                                    logo="./images/office-365-logo.svg"
                                    canImport={!!this.state.office365AccessToken}
                                    loading={this.props.contactsLoading}
                                    clear={this.props.clearContacts}
                                    contacts={contacts}
                                    import={this.getOfficeContacts}
                                    login={this.openOfficeConsentScreen}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = state => {
    return {
        contacts: state.contacts.contacts,
        contactsLoading: state.contacts.loading,
        contactsLastUpdate: state.contacts.last_update
    };
};

const mapDispatchToProps = (dispatch, props) => {
    const { BunqJSClient } = props;
    return {
        contactInfoUpdateGoogle: accessToken => dispatch(contactInfoUpdateGoogle(BunqJSClient, accessToken)),
        contactInfoUpdateApple: filePaths => dispatch(contactInfoUpdateApple(BunqJSClient, filePaths)),
        contactInfoUpdateOffice365: accessToken => dispatch(contactInfoUpdateOffice365(BunqJSClient, accessToken)),
        contactsSetInfoType: (contacts, type) => dispatch(contactsSetInfoType(contacts, type)),
        clearContacts: (type = false) => dispatch(contactsClear(BunqJSClient, type)),
        openSnackbar: message => dispatch(openSnackbar(message))
    };
};
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(translate("translations")(Contacts));
