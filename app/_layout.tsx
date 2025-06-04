import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

export default function Layout() {
    return (
        <Stack>
            <Stack.Screen
                name="(tabs)"
                options={{
                    headerShown: false,
                }}>
            </Stack.Screen>
            <Stack.Screen
                name="onboarding"
                options={{
                    headerShown: false,
                    title: 'Onboarding',
                    presentation: 'modal',
                }}>
            </Stack.Screen>
        </Stack>
    )
}