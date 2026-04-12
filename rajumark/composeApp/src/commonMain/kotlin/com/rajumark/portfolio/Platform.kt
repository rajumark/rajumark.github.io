package com.rajumark.portfolio

interface Platform {
    val name: String
}

expect fun getPlatform(): Platform