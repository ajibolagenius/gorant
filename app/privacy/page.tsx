import React from "react"

export default function PrivacyPage() {
    return (
        <main className="max-w-2xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Anonymous Posting</h2>
                <p>We do not require accounts or collect personal data. All rants and comments are posted anonymously, and no personally identifiable information is stored or associated with your activity.</p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Local Storage & Encryption</h2>
                <p>Your bookmarks and history are stored only in your browser and are encrypted using strong AES encryption. Only you can access this data, and you can delete it at any time from the settings page.</p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">No Tracking</h2>
                <p>We do not use third-party analytics, cookies, or tracking scripts. Your activity is never tracked, shared, or sold to anyone.</p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">User Control</h2>
                <p>You have full control over your data. You can delete your bookmarks, history, and settings at any time via the settings page. Once deleted, your data is permanently removed and cannot be recovered.</p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
                <p>Rants and comments are kept unless you delete them locally. We never share or sell your data. All content is anonymous and cannot be linked back to you.</p>
            </section>
            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Transparency</h2>
                <p>We are committed to transparency. If you have questions about privacy or data handling, please contact us via the support link in the app.</p>
            </section>
        </main>
    )
}
