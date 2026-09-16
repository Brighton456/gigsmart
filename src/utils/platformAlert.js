// Cross-platform alert.
//
// react-native-web's Alert.alert() is a silent no-op, so on web nothing would
// appear when screens call Alert.alert (validation errors, payment status...).
// On web we render a real in-app modal instead; on native we pass through.

import React, { useState, useCallback, useEffect } from 'react';
import { Alert, Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

// Simple event hub so any module can trigger the web dialog without context.
let pushListener = null;

const emit = (payload) => {
  if (pushListener) pushListener(payload);
};

const PlatformAlert = {
  alert(title, message, buttons) {
    if (!isWeb) {
      Alert.alert(title, message, buttons);
      return;
    }
    const normalized = (buttons && buttons.length ? buttons : [{ text: 'OK' }]).map((b, i) => ({
      text: b?.text || (buttons?.length > 1 ? 'Cancel' : 'OK'),
      style: b?.style || 'default',
      onPress: b?.onPress,
      key: `${i}`,
    }));
    emit({ title: title || '', message: message || '', buttons: normalized });
  },
};

export const PlatformAlertHost = () => {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    pushListener = setDialog;
    return () => {
      pushListener = null;
    };
  }, []);

  const close = useCallback(
    (button) => {
      setDialog(null);
      button?.onPress?.();
    },
    []
  );

  if (!isWeb || !dialog) return null;

  const isDestructive = dialog.buttons.some((b) => b.style === 'destructive');

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => close()}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{dialog.title}</Text>
          {dialog.message ? <Text style={styles.message}>{dialog.message}</Text> : null}
          <View style={[styles.buttonRow, dialog.buttons.length > 1 && styles.buttonRowSplit]}>
            {dialog.buttons.map((button, index) => (
              <TouchableOpacity
                key={button.key}
                style={[
                  styles.button,
                  dialog.buttons.length > 1 && styles.buttonSplit,
                  dialog.buttons.length > 1 && index > 0 && styles.buttonSplitNotFirst,
                  button.style === 'cancel' && styles.buttonSecondary,
                ]}
                onPress={() => close(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel'
                      ? styles.buttonTextDark
                      : (button.style === 'destructive' || isDestructive) &&
                        styles.buttonTextDanger,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 18, 34, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#12233f',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a5b75',
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'column',
  },
  buttonRowSplit: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#0055cc',
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonSplit: {
    flex: 1,
    marginTop: 0,
  },
  buttonSplitNotFirst: {
    marginLeft: 10,
  },
  buttonSecondary: {
    backgroundColor: '#eef2f8',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextDanger: {
    fontWeight: '700',
  },
  buttonTextDark: {
    color: '#12233f',
  },
});

export default PlatformAlert;
